import { expect, test, type APIRequestContext } from "@playwright/test";
import { API_URL, MOCK_SMTP, TEST_RATE_LIMIT_MAX } from "../playwright.config";

/**
 * Servicio zenit-api (POST /api/contact) contra un SMTP simulado (tests/mock-smtp.mjs).
 * Se llama directo al servicio (como Traefik) con una IP distinta por prueba en
 * X-Forwarded-For, para que el límite por IP de una prueba no afecte a las demás.
 */

type SentMail = {
  from: string;
  to: string[];
  headers: Record<string, string>;
  text: string;
  html: string;
  raw: string;
};

const ENDPOINT = `${API_URL}/api/contact`;
let ipCounter = 0;
const uniqueIp = () => `10.${process.pid % 250}.${Math.floor(++ipCounter / 250)}.${ipCounter % 250}`;

async function sentMails(request: APIRequestContext): Promise<SentMail[]> {
  return (await (await request.get(`${MOCK_SMTP}/messages`)).json()) as SentMail[];
}

async function findMail(request: APIRequestContext, marker: string): Promise<SentMail | undefined> {
  return (await sentMails(request)).find((mail) => mail.text.includes(marker));
}

const valid = (name: string) => ({
  name,
  company: "Ferretería La Prueba",
  city: "Valencia",
  phone: "0414 123 4567",
  email: "compras@ejemplo.com",
  message: "Quiero distribuir Zenit.",
  product_interest: ["0021-0320"],
  consent: true,
});

function post(request: APIRequestContext, data: unknown, ip = uniqueIp()) {
  return request.post(ENDPOINT, { data, headers: { "X-Forwarded-For": ip } });
}

test.describe("POST /api/contact", () => {
  // Las pruebas de API no dependen del navegador: basta con un proyecto.
  test.skip(({ isMobile }) => isMobile, "basta con un proyecto");

  test("envía el correo a mercadeo con Reply-To del visitante", async ({ request }) => {
    const name = `Envio ${Date.now()}`;
    const response = await post(request, valid(name));
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });

    const mail = await findMail(request, name);
    expect(mail).toBeDefined();
    expect(mail!.to).toEqual(["mercadeo@lefre.com.ve"]);
    expect(mail!.from).toBe("web@lefre.com.ve");
    expect(mail!.headers["reply-to"]).toContain("compras@ejemplo.com");
    expect(mail!.headers.subject).toBe("Nuevo contacto Zenit: Ferretería La Prueba (Valencia)");
    expect(mail!.text).toContain("Teléfono: 0414 123 4567");
    expect(mail!.text).toContain("Producto de interés: 0021-0320");
  });

  test("rechaza datos inválidos con mensajes por campo y sin detalles internos", async ({ request }) => {
    const response = await post(request, { ...valid("A"), email: "no-es-correo", phone: "12", consent: false });
    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(Object.keys(body.fields).sort()).toEqual(["consent", "email", "name", "phone"]);
    expect(body.fields.email).toBe("Escribe un correo electrónico válido.");
    expect(JSON.stringify(body)).not.toMatch(/zod|issue|stack|invalid_|expected/i);
  });

  test("rechaza un mensaje de más de 1000 caracteres y códigos de producto mal formados", async ({ request }) => {
    const response = await post(request, { ...valid("Mensaje Largo"), message: "x".repeat(1001), product_interest: ["abc"] });
    expect(response.status()).toBe(422);
    expect(Object.keys((await response.json()).fields).sort()).toEqual(["message", "product_interest"]);
  });

  test("el honeypot responde ok pero no envía nada", async ({ request }) => {
    const name = `Bot ${Date.now()}`;
    const response = await post(request, { ...valid(name), website: "http://spam.example" });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(await findMail(request, name)).toBeUndefined();
  });

  test("limita los intentos por IP", async ({ request }) => {
    const ip = uniqueIp();
    for (let i = 0; i < TEST_RATE_LIMIT_MAX; i++) {
      // Inválidos a propósito: cuentan igual como intentos y no llenan el buzón.
      expect((await post(request, { consent: false }, ip)).status()).toBe(422);
    }
    const blocked = await post(request, valid(`Limite ${Date.now()}`), ip);
    expect(blocked.status()).toBe(429);
    expect(Number(blocked.headers()["retry-after"])).toBeGreaterThan(0);
    expect((await blocked.json()).error).toMatch(/varios intentos/);

    // Otra IP sigue pudiendo enviar.
    expect((await post(request, { consent: false })).status()).toBe(422);
  });

  test("rechaza cuerpos demasiado grandes", async ({ request }) => {
    const response = await post(request, { ...valid("Grande"), message: "x".repeat(20_000) });
    expect(response.status()).toBe(413);
    expect((await response.json()).ok).toBe(false);
  });

  test("solo acepta JSON y solo POST", async ({ request }) => {
    const form = await request.post(ENDPOINT, { form: { name: "x" }, headers: { "X-Forwarded-For": uniqueIp() } });
    expect(form.status()).toBe(415);
    const get = await request.get(ENDPOINT);
    expect(get.status()).toBe(405);
    expect(get.headers().allow).toBe("POST");
  });

  test("escapa el contenido del visitante en el correo", async ({ request }) => {
    const marker = `Escape${Date.now()}`;
    const response = await post(request, {
      ...valid(`<script>alert("x")</script> ${marker}`),
      company: "Ferre <b>Negrita</b> & Co\r\nBcc: intruso@ejemplo.com",
      message: `<img src=x onerror="alert(1)"> 'comillas'`,
    });
    expect(response.status()).toBe(200);

    const mail = await findMail(request, marker);
    expect(mail).toBeDefined();
    // HTML: nada del visitante llega como etiqueta.
    expect(mail!.html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(mail!.html).toContain("Ferre &lt;b&gt;Negrita&lt;/b&gt; &amp; Co");
    expect(mail!.html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &#39;comillas&#39;");
    expect(mail!.html).not.toMatch(/<script|<img|<b>/i);
    // Asunto en una sola línea: el salto de línea no inyecta una cabecera Bcc.
    expect(mail!.headers.subject).not.toMatch(/[\r\n]/);
    expect(mail!.headers.bcc).toBeUndefined();
    expect(mail!.to).toEqual(["mercadeo@lefre.com.ve"]);
  });

  test("si el SMTP falla, responde un error genérico", async ({ request }) => {
    const response = await post(request, { ...valid("Cliente FALLA-SMTP") });
    expect(response.status()).toBe(502);
    const body = await response.json();
    expect(body).toEqual({
      ok: false,
      error: "No pudimos enviar tu solicitud. Inténtalo de nuevo en unos minutos o escríbenos por WhatsApp.",
    });
  });
});

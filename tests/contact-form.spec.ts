import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { MOCK_SMTP } from "../playwright.config";

/**
 * Formulario de contacto en el navegador: sitio estático + /api/ reenviado a zenit-api
 * (como Traefik) + SMTP simulado. Cada prueba usa su propia IP para el límite de intentos.
 */

type SentMail = { to: string[]; headers: Record<string, string>; text: string };

let ipCounter = 0;
async function useOwnIp(page: Page) {
  await page.setExtraHTTPHeaders({ "X-Forwarded-For": `172.16.${process.pid % 250}.${++ipCounter % 250}` });
}

async function findMail(request: APIRequestContext, marker: string) {
  const mails = (await (await request.get(`${MOCK_SMTP}/messages`)).json()) as SentMail[];
  return mails.find((mail) => mail.text.includes(marker));
}

async function fillForm(page: Page, name: string) {
  const form = page.locator("#contacto form");
  await form.getByLabel("Nombre y apellido").fill(name);
  await form.getByLabel("Empresa o ferretería").fill("Ferretería La Prueba");
  await form.getByLabel("Ciudad").fill("Maracaibo");
  await form.getByLabel("Teléfono").fill("0261 555 1234");
  await form.getByLabel("Correo electrónico").fill("ventas@ejemplo.com");
  await form.getByLabel(/aceptas que Inversiones Lefre te contacte/).check();
  return form;
}

test.describe("formulario de contacto", () => {
  test.beforeEach(async ({ page }) => useOwnIp(page));

  test("tiene los campos del brief y un solo checkbox (consentimiento)", async ({ page }) => {
    await page.goto("/#contacto");
    const form = page.locator("#contacto form");
    for (const label of ["Nombre y apellido", "Empresa o ferretería", "Ciudad", "Teléfono", "Correo electrónico", "Mensaje"]) {
      await expect(form.getByLabel(label)).toBeVisible();
    }
    await expect(form.getByRole("checkbox")).toHaveCount(1);
  });

  test("desde una ficha, precarga el producto y envía el correo", async ({ page, request }, info) => {
    const name = `Prueba ${info.project.name} ${Date.now()}`;
    await page.goto("/?producto=0021-0320#contacto");
    const form = await fillForm(page, name);
    await expect(form.getByLabel("Mensaje")).toHaveValue(
      "Me interesa: Bomba sumergible solar de cobre 1/2 HP con 2 paneles.",
    );
    await form.getByRole("button", { name: "Enviar solicitud" }).click();
    await expect(page.getByRole("status")).toContainText("Recibimos tu solicitud");

    const mail = await findMail(request, name);
    expect(mail).toBeDefined();
    expect(mail!.to).toEqual(["mercadeo@lefre.com.ve"]);
    expect(mail!.headers["reply-to"]).toContain("ventas@ejemplo.com");
    expect(mail!.text).toContain("Producto de interés: 0021-0320");
    expect(mail!.text).toContain("Me interesa: Bomba sumergible solar de cobre 1/2 HP con 2 paneles.");
  });

  test("muestra errores por campo si se envía vacío", async ({ page }) => {
    await page.goto("/#contacto");
    const form = page.locator("#contacto form");
    await form.getByRole("button", { name: "Enviar solicitud" }).click();
    await expect(form.getByText("Escribe tu nombre y apellido.")).toBeVisible();
    await expect(form.getByText("Debes aceptar que Inversiones Lefre te contacte.")).toBeVisible();
    await expect(form.getByLabel("Nombre y apellido")).toBeFocused();
    await expect(page.getByTestId("contact-fallback")).toHaveCount(0);
  });

  test("si el envío falla, muestra un error claro y el botón de WhatsApp", async ({ page }, info) => {
    await page.goto("/#contacto");
    const form = await fillForm(page, `FALLA-SMTP ${info.project.name}`);
    await form.getByRole("button", { name: "Enviar solicitud" }).click();
    await expect(form.getByRole("alert")).toContainText("No pudimos enviar tu solicitud");
    const whatsapp = page.getByTestId("contact-fallback").getByRole("link", { name: /WhatsApp/ });
    await expect(whatsapp).toBeVisible();
    const href = new URL((await whatsapp.getAttribute("href"))!);
    expect(href.origin + href.pathname).toBe("https://wa.me/584244721107");
    expect(href.searchParams.get("text")).toMatch(/quiero distribuir Zenit/);
  });
});

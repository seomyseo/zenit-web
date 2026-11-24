import { expect, test, type APIRequestContext } from "@playwright/test";
import { MOCK_WEBHOOK } from "../playwright.config";

type ReceivedLead = {
  created_at: string;
  origin: string;
  name: string;
  company: string;
  city: string;
  phone: string;
  email: string;
  product_interest: string[];
  consent: boolean;
  _auth: string | null;
};

async function receivedLeads(request: APIRequestContext): Promise<ReceivedLead[]> {
  return (await (await request.get(`${MOCK_WEBHOOK}/leads`)).json()) as ReceivedLead[];
}

const validLead = (name: string) => ({
  name,
  company: "Ferretería La Prueba",
  city: "Valencia",
  phone: "0414 123 4567",
  email: "compras@ejemplo.com",
  product_interest: ["0021-0318"],
  consent: true,
});

test.describe("formulario de captación", () => {
  test("envía el lead al webhook con el producto preseleccionado", async ({ page, request }, info) => {
    const name = `Prueba ${info.project.name} ${Date.now()}`;
    await page.goto("/?producto=0021-0320#contacto");
    const form = page.locator("#contacto form");
    await expect(form.getByLabel("Bomba sumergible solar de cobre 1/2 HP con 2 paneles")).toBeChecked();

    await form.getByLabel("Nombre y apellido").fill(name);
    await form.getByLabel("Empresa o ferretería").fill("Ferretería La Prueba");
    await form.getByLabel("Ciudad").fill("Maracaibo");
    await form.getByLabel("Teléfono").fill("0261 555 1234");
    await form.getByLabel("Correo electrónico").fill("ventas@ejemplo.com");
    await form.getByLabel("Presostato hidroneumático 20-40 PSI, conexión macho").check();
    await form.getByLabel(/aceptas que Inversiones Lefre te contacte/).check();
    await form.getByRole("button", { name: "Enviar solicitud" }).click();

    await expect(page.getByRole("status")).toContainText("Recibimos tu solicitud");

    const lead = (await receivedLeads(request)).find((l) => l.name === name);
    expect(lead).toBeDefined();
    expect(lead).toMatchObject({
      origin: "zenit.com.ve",
      company: "Ferretería La Prueba",
      city: "Maracaibo",
      email: "ventas@ejemplo.com",
      consent: true,
      _auth: "Bearer token-de-prueba-123456",
    });
    expect(lead!.product_interest.sort()).toEqual(["0021-0320", "0021-0331"]);
    expect(Number.isNaN(Date.parse(lead!.created_at))).toBe(false);
  });

  test("muestra errores por campo si se envía vacío", async ({ page }) => {
    await page.goto("/#contacto");
    const form = page.locator("#contacto form");
    await form.getByRole("button", { name: "Enviar solicitud" }).click();
    await expect(form.getByText("Escribe tu nombre y apellido.")).toBeVisible();
    await expect(form.getByText("Debes aceptar que Inversiones Lefre te contacte.")).toBeVisible();
    await expect(form.getByLabel("Nombre y apellido")).toBeFocused();
  });

  test("si el webhook falla, muestra un error claro", async ({ page }, info) => {
    await page.goto("/#contacto");
    const form = page.locator("#contacto form");
    await form.getByLabel("Nombre y apellido").fill(`FALLA ${info.project.name}`);
    await form.getByLabel("Empresa o ferretería").fill("Ferretería La Prueba");
    await form.getByLabel("Ciudad").fill("Caracas");
    await form.getByLabel("Teléfono").fill("0212 555 1234");
    await form.getByLabel("Correo electrónico").fill("x@ejemplo.com");
    await form.getByLabel(/aceptas que Inversiones Lefre te contacte/).check();
    await form.getByRole("button", { name: "Enviar solicitud" }).click();
    await expect(form.getByRole("alert")).toContainText("No pudimos enviar tu solicitud");
  });
});

test.describe("POST /api/leads", () => {
  test.skip(({ isMobile }) => isMobile, "basta con un proyecto");

  test("rechaza datos inválidos sin detalles internos", async ({ request }) => {
    const response = await request.post("/api/leads", {
      data: { ...validLead("A"), email: "no-es-correo", product_interest: ["9999-9999"] },
    });
    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(Object.keys(body.fields).sort()).toEqual(["email", "name"]);
    expect(JSON.stringify(body)).not.toMatch(/zod|issue|stack|invalid_/i);
  });

  test("rechaza productos que no existen", async ({ request }) => {
    const response = await request.post("/api/leads", {
      data: { ...validLead("Producto Raro"), product_interest: ["9999-9999"] },
    });
    expect(response.status()).toBe(422);
    expect((await response.json()).fields).toHaveProperty("product_interest");
  });

  test("el honeypot responde ok pero no envía nada", async ({ request }) => {
    const name = `Bot ${Date.now()}`;
    const response = await request.post("/api/leads", {
      data: { ...validLead(name), website: "http://spam.example" },
    });
    expect(response.status()).toBe(200);
    expect((await receivedLeads(request)).some((l) => l.name === name)).toBe(false);
  });

  test("solo acepta JSON", async ({ request }) => {
    const response = await request.post("/api/leads", { form: { name: "x" } });
    expect(response.status()).toBe(415);
  });
});

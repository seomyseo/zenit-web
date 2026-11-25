import { expect, test } from "@playwright/test";

/**
 * Botón de WhatsApp con mensaje precargado (CLAUDE.md, "Captación"): en la sección de
 * contacto, en las fichas y en el footer. Siempre WhatsApp (sin desvío a Instagram).
 */

const WHATSAPP = "https://wa.me/584244721107";

function checkHref(href: string | null, expectedText: RegExp) {
  expect(href).not.toBeNull();
  const url = new URL(href!);
  expect(url.origin + url.pathname).toBe(WHATSAPP);
  expect(url.searchParams.get("text")).toMatch(expectedText);
  // Espacios como %20 (no "+").
  expect(href).not.toContain("+");
}

test.describe("botón de WhatsApp", () => {
  test("la sección de contacto abre WhatsApp con el mensaje de distribución", async ({ page }) => {
    await page.goto("/#contacto");
    const cta = page.locator("#contacto [data-lead-channel='whatsapp']");
    await expect(cta).toHaveCount(1);
    await expect(cta).toHaveAttribute("target", "_blank");
    checkHref(await cta.getAttribute("href"), /^Hola, soy ferretero de \[ciudad\] y quiero distribuir Zenit\.$/);
  });

  test("el footer tiene el botón de WhatsApp", async ({ page }) => {
    await page.goto("/productos");
    const cta = page.locator("footer [data-lead-channel='whatsapp']");
    await expect(cta).toHaveCount(1);
    checkHref(await cta.getAttribute("href"), /quiero distribuir Zenit/);
  });

  test("la ficha abre WhatsApp con el producto y su código, y enlaza al formulario", async ({ page }) => {
    await page.goto("/productos/bomba-sumergible-solar-cobre-1-2hp");
    const ctas = page.locator("main [data-lead-channel='whatsapp']");
    await expect(ctas).toHaveCount(2);
    for (const href of await ctas.evaluateAll((els) => els.map((a) => a.getAttribute("href")))) {
      checkHref(href, /Bomba sumergible solar de cobre 1\/2 HP con 2 paneles \(0021-0320\)/);
    }
    await expect(page.getByRole("link", { name: "o déjanos tus datos" })).toHaveAttribute(
      "href",
      "/?producto=0021-0320#contacto",
    );
  });

  test("Instagram queda solo como enlace de redes", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("a[href^='https://ig.me']")).toHaveCount(0);
    await expect(page.locator("#contacto a[href*='instagram.com']")).toHaveCount(1);
  });
});

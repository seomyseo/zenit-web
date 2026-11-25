import { expect, test } from "@playwright/test";

/**
 * Captación de esta fase: CTA de WhatsApp con mensaje precargado (CLAUDE.md, "Captación").
 * Si el build no tiene NEXT_PUBLIC_WHATSAPP_URL, el CTA lleva al chat de Instagram.
 */

function checkHref(href: string | null, expectedText: RegExp) {
  expect(href).not.toBeNull();
  const url = new URL(href!);
  if (url.hostname === "wa.me") {
    expect(url.searchParams.get("text")).toMatch(expectedText);
  } else {
    expect(url.toString()).toBe("https://ig.me/m/lefrevzla");
  }
}

test.describe("CTA de contacto", () => {
  test("no hay formulario con envío en el sitio", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("form")).toHaveCount(0);
    await expect(page.locator("#contacto input, #contacto textarea")).toHaveCount(0);
  });

  test("la sección de contacto abre WhatsApp con el mensaje de distribución", async ({ page }) => {
    await page.goto("/#contacto");
    const cta = page.locator("#contacto [data-lead-channel]");
    await expect(cta).toHaveCount(1);
    await expect(cta).toHaveAttribute("target", "_blank");
    checkHref(await cta.getAttribute("href"), /quiero distribuir Zenit/);
  });

  test("la ficha abre WhatsApp con el producto y su código", async ({ page }) => {
    await page.goto("/productos/bomba-sumergible-solar-cobre-1-2hp");
    const ctas = page.locator("main [data-lead-channel]");
    await expect(ctas).toHaveCount(2);
    for (const href of await ctas.evaluateAll((els) => els.map((a) => a.getAttribute("href")))) {
      checkHref(href, /Bomba sumergible solar de cobre 1\/2 HP con 2 paneles \(0021-0320\)/);
    }
  });
});

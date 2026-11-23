import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test("muestra el catálogo con 11 productos en 2 grupos", async ({ page }) => {
    await page.goto("/");
    const catalog = page.locator("#productos");
    await expect(catalog.locator("[data-group]")).toHaveCount(2);
    await expect(catalog.locator('[data-group="agricola"] article')).toHaveCount(9);
    await expect(catalog.locator('[data-group="automotriz"] article')).toHaveCount(2);
    await expect(catalog.getByRole("heading", { level: 3, name: /Agrícola/ })).toBeVisible();
    await expect(catalog.getByRole("heading", { level: 3, name: /Automotriz/ })).toBeVisible();
  });

  test("tiene un solo h1 y el lema oficial", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByText("Tecnología de altura", { exact: true })).toBeVisible();
    await expect(page.getByText(/impulsando el mañana/i)).toHaveCount(0);
  });

  test("no muestra precios", async ({ page }) => {
    await page.goto("/");
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/\$\s?\d|\bUSD\b|\bBs\.?\s?\d|precio:/i);
  });

  test("las tarjetas enlazan a la ficha de cada producto", async ({ page }) => {
    await page.goto("/");
    const links = page.locator("#productos article h4 a");
    await expect(links).toHaveCount(11);
    for (const href of await links.evaluateAll((els) => els.map((a) => a.getAttribute("href")))) {
      expect(href).toMatch(/^\/productos\/[a-z0-9-]+$/);
    }
  });
});

test.describe("menú móvil", () => {
  test.skip(({ isMobile }) => !isMobile, "solo en móvil");

  test("abre y cierra con teclado", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Abrir menú" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Productos" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});

import { expect, test } from "@playwright/test";

test("la home carga sin errores de consola", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("lang", "es-VE");
  expect(errors).toEqual([]);
});

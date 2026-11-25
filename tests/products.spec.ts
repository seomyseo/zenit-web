import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

type ProductJson = { slug: string; erpCode: string; name: string; status: string; model?: string };

const products: ProductJson[] = readdirSync(path.join(process.cwd(), "content", "products"))
  .filter((file) => file.endsWith(".json"))
  .map((file) => JSON.parse(readFileSync(path.join(process.cwd(), "content", "products", file), "utf8")))
  .filter((product: ProductJson) => product.status === "published");

test.describe("fichas de producto", () => {
  test.skip(({ isMobile }) => isMobile, "basta con un proyecto");

  test("hay 11 productos publicados", () => {
    expect(products).toHaveLength(11);
  });

  for (const product of products) {
    test(`/productos/${product.slug} responde 200 con JSON-LD sin precio`, async ({ page }) => {
      const response = await page.goto(`/productos/${product.slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveText(product.name);

      const jsonLd = JSON.parse(
        (await page.locator('script[type="application/ld+json"]').first().textContent()) ?? "{}",
      );
      expect(jsonLd["@type"]).toBe("Product");
      expect(jsonLd.sku).toBe(product.erpCode);
      expect(jsonLd.brand?.name).toBe("Zenit");
      expect(jsonLd).not.toHaveProperty("offers");

      const text = await page.locator("main").innerText();
      expect(text).not.toMatch(/\$\s?\d|\bUSD\b|\bBs\.?\s?\d/i);
    });
  }

  test("un slug inexistente da 404", async ({ page }) => {
    const response = await page.goto("/productos/no-existe");
    expect(response?.status()).toBe(404);
  });

  test("/productos muestra el catálogo completo", async ({ page }) => {
    await page.goto("/productos");
    await expect(page.locator("h1")).toHaveText("Productos Zenit");
    await expect(page.locator("#productos article")).toHaveCount(11);
  });
});

test.describe("SEO", () => {
  test.skip(({ isMobile }) => isMobile, "basta con un proyecto");

  // El build decide si el sitio es indexable (NEXT_PUBLIC_SITE_INDEXABLE): se deduce de robots.txt.
  test("indexación coherente entre robots.txt, sitemap y meta robots", async ({ request, page }) => {
    const robots = await (await request.get("/robots.txt")).text();
    const indexable = /Sitemap:/.test(robots);
    const sitemap = await request.get("/sitemap.xml");
    await page.goto("/");
    const meta = await page.locator('meta[name="robots"]').getAttribute("content");

    if (!indexable) {
      expect(robots).toMatch(/Disallow: \/\s*$/m);
      expect(sitemap.status()).toBe(404);
      expect(meta).toBe("noindex, nofollow");
      return;
    }

    expect(meta).toBe("index, follow");
    expect(robots).toMatch(/Disallow: \/lab\//);
    const urls = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname);
    expect(urls).toContain("/");
    expect(urls).toContain("/productos");
    for (const product of products) expect(urls).toContain(`/productos/${product.slug}`);
    expect(urls).toHaveLength(2 + products.length);
  });
});

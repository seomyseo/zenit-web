import "server-only";
import { loadAllProducts } from "./load";
import { FAMILY_ORDER, GROUP_ORDER, type Product, type ProductGroup } from "./schema";

export * from "./schema";

let cache: Product[] | undefined;

function allProducts(): Product[] {
  cache ??= loadAllProducts();
  return cache;
}

/**
 * Productos visibles en la web, ordenados por grupo (orden del ERP), familia y,
 * dentro de cada familia, el producto base antes que sus variantes.
 */
export function getPublishedProducts(): Product[] {
  return allProducts()
    .filter((product) => product.status === "published")
    .sort(
      (a, b) =>
        GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) ||
        FAMILY_ORDER.indexOf(a.family) - FAMILY_ORDER.indexOf(b.family) ||
        Number(Boolean(a.variantOf)) - Number(Boolean(b.variantOf)) ||
        a.erpCode.localeCompare(b.erpCode),
    );
}

export function getProductBySlug(slug: string): Product | undefined {
  return getPublishedProducts().find((product) => product.slug === slug);
}

export function getProductsByGroup(): { group: ProductGroup; products: Product[] }[] {
  const published = getPublishedProducts();
  return GROUP_ORDER.map((group) => ({
    group,
    products: published.filter((product) => product.group === group),
  })).filter((entry) => entry.products.length > 0);
}

/** Hasta `limit` productos relacionados: primero misma familia, luego mismo grupo. */
export function getRelatedProducts(product: Product, limit = 3): Product[] {
  const others = getPublishedProducts().filter((p) => p.erpCode !== product.erpCode);
  const sameFamily = others.filter((p) => p.family === product.family);
  const sameGroup = others.filter(
    (p) => p.group === product.group && p.family !== product.family,
  );
  return [...sameFamily, ...sameGroup].slice(0, limit);
}

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { productSchema, type Product } from "./schema";

/**
 * Lee y valida content/products/*.json. Se ejecuta en build (páginas estáticas)
 * y en scripts/validate-products.ts. Cualquier error detiene el build e indica el archivo.
 */
export function loadAllProducts(root: string = process.cwd()): Product[] {
  const dir = path.join(root, "content", "products");
  const files = readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .sort();

  const errors: string[] = [];
  const products: Product[] = [];

  for (const file of files) {
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(path.join(dir, file), "utf8"));
    } catch (error) {
      errors.push(`${file}: JSON inválido (${(error as Error).message})`);
      continue;
    }

    const result = productSchema.safeParse(raw);
    if (!result.success) {
      errors.push(`${file}:\n${z.prettifyError(result.error)}`);
      continue;
    }

    const product = result.data;
    if (`${product.slug}.json` !== file) {
      errors.push(`${file}: el nombre del archivo debe ser "${product.slug}.json"`);
    }
    for (const asset of [...product.images, ...(product.files ?? [])]) {
      if (!existsSync(path.join(root, "public", asset.src))) {
        errors.push(`${file}: no existe public${asset.src}`);
      }
    }
    products.push(product);
  }

  const seen = { slug: new Map<string, string>(), erpCode: new Map<string, string>() };
  for (const product of products) {
    for (const key of ["slug", "erpCode"] as const) {
      const other = seen[key].get(product[key]);
      if (other) errors.push(`${key} duplicado "${product[key]}" en ${other} y ${product.slug}`);
      seen[key].set(product[key], product.slug);
    }
  }
  for (const product of products) {
    if (product.variantOf && !seen.erpCode.has(product.variantOf)) {
      errors.push(`${product.slug}: variantOf "${product.variantOf}" no corresponde a ningún producto`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Datos de producto inválidos:\n\n${errors.join("\n\n")}`);
  }
  return products;
}

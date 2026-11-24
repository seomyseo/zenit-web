import "server-only";
import { GROUP_LABELS, getProductsByGroup, type Product, type ProductGroup } from "@/lib/products";

/**
 * Datos para las tarjetas de catálogo (laboratorio de tarjetas). Todo sale de los
 * JSON de producto: si una fila no existe, no aparece (no se inventa nada).
 */

export type CardFact = { label: string; value: string };
export type CardProduct = {
  erpCode: string;
  slug: string;
  name: string;
  model?: string;
  shortDescription: string;
  image: { src: string; alt: string };
  /** Tipo de producto ("Kit solar", "Eléctrica", "Presostato"…). */
  kind: string;
  /** Variante que distingue productos hermanos (cobre/aleación, hembra/macho, rojo/verde). */
  variant?: string;
  facts: CardFact[];
};
export type CardGroup = { group: ProductGroup; label: string; products: CardProduct[] };

/** Filas candidatas, en orden de preferencia, con su etiqueta corta. */
const FACT_ROWS: [row: string, short: string][] = [
  ["Altura máxima (H. máx.)", "Altura máx."],
  ["Altura máxima", "Altura máx."],
  ["Caudal máximo (Q. máx.)", "Caudal máx."],
  ["Caudal máximo", "Caudal máx."],
  ["Rango de presión (ajuste de fábrica)", "Ajuste"],
  ["Presión máxima", "Presión máx."],
  ["Potencia", "Potencia"],
  ["Corriente máxima", "Corriente"],
  ["Voltaje", "Voltaje"],
  ["Rosca de presión", "Rosca"],
  ["Grado de protección", "Protección"],
  ["pH", "pH"],
  ["Presentación", "Por caja"],
];

/**
 * Número y unidad no se separan ("110/220 V", "1/2 HP") y los rangos no se cortan
 * en el guion ("20-40 PSI"). Se quita lo que va entre paréntesis para la tarjeta.
 */
export function keepTogether(text: string): string {
  return text
    .replace(/\s*\(.*?\)/g, "")
    .replace(/(\d)-(\d)/g, "$1‑$2")
    .replace(/(\d)\s+(?=[A-Za-zµ°%"'])/g, "$1 ");
}

function rowValue(product: Product, label: string): string | undefined {
  for (const group of product.specGroups ?? []) {
    const row = group.rows.find((r) => r.label === label);
    if (row) return row.value;
  }
  return undefined;
}

function facts(product: Product): CardFact[] {
  const out: CardFact[] = [];
  const seen = new Set<string>();
  for (const [row, short] of FACT_ROWS) {
    if (out.length === 3 || seen.has(short)) continue;
    let value = rowValue(product, row);
    if (!value) continue;
    // Presentación del refrigerante: solo "4 galones" (dato de la ficha).
    if (row === "Presentación") value = /(\d+ galones)/i.exec(value)?.[1] ?? value;
    out.push({ label: short, value: keepTogether(value) });
    seen.add(short);
  }
  return out;
}

const isSolarKit = (p: Product) => p.includes?.some((item) => /panel/i.test(item)) ?? false;

function kind(product: Product): string {
  switch (product.family) {
    case "presostato":
      return "Presostato";
    case "control":
      return "Control de presión";
    case "refrigerante":
      return "Refrigerante";
    default:
      return isSolarKit(product) ? "Kit solar" : "Eléctrica";
  }
}

function variant(product: Product): string | undefined {
  if (product.family === "presostato") return rowValue(product, "Conexión");
  if (product.family === "refrigerante") return rowValue(product, "Color");
  return rowValue(product, "Bobinado del motor");
}

export function toCard(product: Product): CardProduct {
  return {
    erpCode: product.erpCode,
    slug: product.slug,
    name: keepTogether(product.name),
    model: product.model,
    shortDescription: product.shortDescription,
    image: product.images[0]!,
    kind: kind(product),
    variant: variant(product),
    facts: facts(product),
  };
}

export function getCardGroups(): CardGroup[] {
  return getProductsByGroup().map(({ group, products }) => ({
    group,
    label: GROUP_LABELS[group],
    products: products.map(toCard),
  }));
}

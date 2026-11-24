import "server-only";
import { getPublishedProducts, type Product } from "@/lib/products";

/**
 * Datos de las variantes de hero (laboratorio). Todas las cifras salen de los JSON
 * de producto: si un dato no existe, falla el build en vez de inventarlo.
 */

export type HeroFigure = { value: string; label: string };
export type HeroSlide = {
  erpCode: string;
  slug: string;
  kicker: string;
  name: string;
  model?: string;
  image: { src: string; alt: string };
  figures: HeroFigure[];
};

function byCode(erpCode: string): Product {
  const product = getPublishedProducts().find((p) => p.erpCode === erpCode);
  if (!product) throw new Error(`Producto ${erpCode} no publicado`);
  return product;
}

function spec(product: Product, label: string): string {
  for (const group of product.specGroups ?? []) {
    const row = group.rows.find((r) => r.label === label);
    if (row) return row.value;
  }
  throw new Error(`${product.erpCode}: no existe la fila "${label}"`);
}

function slide(product: Product, kicker: string, figures: HeroFigure[]): HeroSlide {
  return {
    erpCode: product.erpCode,
    slug: product.slug,
    kicker,
    name: product.name,
    model: product.model,
    image: product.images[0]!,
    figures,
  };
}

export function getHeroSlides(): HeroSlide[] {
  const electric = byCode("0021-0314");
  const solar = byCode("0021-0318");
  const coolant = byCode("2352-0125");

  const shelfLife = spec(coolant, "Caducidad");
  if (!shelfLife.startsWith("24 meses")) throw new Error("Caducidad del refrigerante cambió");

  // "1 HP (750 W)" → "1 HP" y "750 W"
  const power = /^(.+?)\s*\((.+)\)$/.exec(spec(electric, "Potencia"));
  if (!power) throw new Error("Formato de potencia inesperado en 0021-0314");

  return [
    slide(electric, "Bomba eléctrica", [
      { value: power[1]!, label: "potencia" },
      { value: power[2]!, label: "potencia nominal" },
      { value: spec(electric, "Voltaje"), label: "voltaje" },
    ]),
    slide(solar, "Kit de bombeo solar", [
      { value: spec(solar, "Altura máxima (H. máx.)"), label: "altura máxima" },
      { value: spec(solar, "Caudal máximo (Q. máx.)"), label: "caudal máximo" },
      { value: spec(solar, "Potencia"), label: "motor solar" },
    ]),
    slide(coolant, "Línea automotriz", [
      { value: "Listo", label: "para usar, sin agua" },
      { value: `pH ${spec(coolant, "pH")}`, label: "medido en ficha" },
      { value: "24 meses", label: "de vida en envase sellado" },
    ]),
  ];
}

/** Productos para la vitrina (variante C), en orden de aparición. */
export function getShelfProducts(): HeroSlide[] {
  return ["0021-0314", "0021-0312", "0021-0330", "0021-0332", "2352-0125"].map((code) => {
    const product = byCode(code);
    return slide(product, "", []);
  });
}

/** Modelos comerciales (sin códigos ERP) para la cinta en movimiento (variante C). */
export function getModelCodes(): string[] {
  return getPublishedProducts().flatMap((p) => (p.model ? [p.model] : []));
}

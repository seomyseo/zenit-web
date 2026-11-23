/**
 * Extrae los 4 logos oficiales del manual de marca como SVG vectorial.
 *
 *   content/source/brand/Logo_Zenit_5x5_2.pdf, páginas 1 a 4
 *   → public/brand/zenit-{color,negro,blanco,gris}.svg
 *   → public/brand/zenit-alas-{verde,gris}.svg   (franjas del ala, motivo decorativo)
 *
 * No se redibuja nada: pdftocairo exporta los trazos tal cual. Solo se quita el
 * fondo de página (pág. 3) y se ajusta el viewBox al contorno del logo.
 *
 * Uso: pnpm assets:brand   (requiere pdftocairo en PATH o en la variable PDFTOCAIRO)
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const PDF = path.join(ROOT, "content", "source", "brand", "Logo_Zenit_5x5_2.pdf");
const OUT = path.join(ROOT, "public", "brand");
const PDFTOCAIRO = process.env.PDFTOCAIRO ?? "pdftocairo";

const pages = [
  { page: 1, name: "color" },
  { page: 2, name: "negro" },
  { page: 3, name: "blanco" },
  { page: 4, name: "gris" },
] as const;

type Box = { minX: number; minY: number; maxX: number; maxY: number };

/** Caja que contiene todos los puntos de los trazos (incluye puntos de control: margen seguro). */
function boundingBox(paths: string[]): Box {
  const box: Box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const d of paths) {
    const nums = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const x = nums[i]!;
      const y = nums[i + 1]!;
      box.minX = Math.min(box.minX, x);
      box.maxX = Math.max(box.maxX, x);
      box.minY = Math.min(box.minY, y);
      box.maxY = Math.max(box.maxY, y);
    }
  }
  return box;
}

const round = (n: number) => Math.round(n * 1000) / 1000;

function viewBoxOf(box: Box): string {
  return [box.minX, box.minY, box.maxX - box.minX, box.maxY - box.minY].map(round).join(" ");
}

/** Quita el fondo de página (bloque con clip-path) y la cabecera de tamaño en pt. */
function cleanSvg(svg: string): { body: string[]; paths: string[] } {
  const withoutBackground = svg
    .replace(/<defs>[\s\S]*?<\/defs>\s*/g, "")
    .replace(/<g clip-path="url\(#clip-\d+\)">[\s\S]*?<\/g>\s*/g, "");
  const body = withoutBackground.match(/<path [^>]*\/>/g) ?? [];
  const paths = body.map((tag) => /\sd="([^"]+)"/.exec(tag)?.[1] ?? "");
  if (body.length === 0) throw new Error("SVG sin trazos");
  return { body, paths };
}

function wrap(viewBox: string, body: string[], title: string): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" ${
      title ? `role="img" aria-label="${title}"` : 'aria-hidden="true"'
    }>`,
    ...body,
    "</svg>",
    "",
  ].join("\n");
}

function main() {
  mkdirSync(OUT, { recursive: true });
  const tmp = mkdtempSync(path.join(tmpdir(), "zenit-brand-"));
  try {
    for (const { page, name } of pages) {
      const file = path.join(tmp, `p${page}.svg`);
      execFileSync(PDFTOCAIRO, ["-svg", "-f", String(page), "-l", String(page), PDF, file]);
      const { body, paths } = cleanSvg(readFileSync(file, "utf8"));
      const box = boundingBox(paths);
      writeFileSync(path.join(OUT, `zenit-${name}.svg`), wrap(viewBoxOf(box), body, "Zenit"));
      console.log(`logo  pág. ${page} → zenit-${name}.svg  viewBox ${viewBoxOf(box)}`);

      // Motivo: las dos franjas del ala izquierda (los dos primeros trazos), mismo vector.
      if (name === "color" || name === "gris") {
        const wing = body.slice(0, 2);
        const wingBox = boundingBox(paths.slice(0, 2));
        const out = name === "color" ? "zenit-alas-verde.svg" : "zenit-alas-gris.svg";
        writeFileSync(path.join(OUT, out), wrap(viewBoxOf(wingBox), wing, ""));
        console.log(`motivo pág. ${page} → ${out}`);
      }
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

main();

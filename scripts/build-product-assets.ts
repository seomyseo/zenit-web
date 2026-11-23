/**
 * Genera las imágenes publicables de producto en public/products/ a partir de
 * content/source/ (que nunca se sirve ni entra a la imagen Docker).
 *
 * - Fotos: content/source/Products/<erpCode>-1.png → public/products/<slug>.png
 * - Curva y diagramas: se rasteriza la página del PDF con pdftoppm (poppler)
 *   y se recorta con sharp. Recortes medidos sobre páginas a 200 dpi (1700×2200).
 *
 * Uso: pnpm assets:products   (requiere pdftoppm en PATH o en la variable PDFTOPPM)
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(ROOT, "content", "source", "Products");
const OUT = path.join(ROOT, "public", "products");
const PDFTOPPM = process.env.PDFTOPPM ?? "pdftoppm";
const DPI = 200;

const photos: Record<string, string> = {
  "0021-0318": "bomba-centrifuga-solar-cobre-1hp",
  "0021-0314": "bomba-centrifuga-cobre-1hp",
  "0021-0316": "bomba-periferica-solar-cobre-1-2hp",
  "0021-0310": "bomba-periferica-aleacion-1-2hp",
  "0021-0312": "bomba-periferica-cobre-1-2hp",
  "0021-0320": "bomba-sumergible-solar-cobre-1-2hp",
  "0021-0332": "presostato-hidroneumatico-hembra",
  "0021-0331": "presostato-hidroneumatico-macho",
  "0021-0330": "control-automatico-presion-bombas",
  "2352-0124": "refrigerante-rojo-galon",
  "2352-0125": "refrigerante-verde-galon",
};

type Crop = { left: number; top: number; width: number; height: number };
type PdfCrop = { pdf: string; page: number; crop: Crop; out: string };

// Solo ZBS-001S (curva + conexión) y ZBC-002S (conexión): ver BRIEF sección 5.
const pdfCrops: PdfCrop[] = [
  {
    pdf: "FICHA TECNICA BOMBA SUMERGIBLE ZENIT.pdf",
    page: 2,
    crop: { left: 357, top: 1321, width: 893, height: 786 },
    out: "bomba-sumergible-solar-cobre-1-2hp-curva.png",
  },
  {
    pdf: "FICHA TECNICA BOMBA SUMERGIBLE ZENIT.pdf",
    page: 3,
    crop: { left: 71, top: 536, width: 1519, height: 1455 },
    out: "bomba-sumergible-solar-cobre-1-2hp-conexion.png",
  },
  {
    pdf: "FICHA TECNICA BOMBA CENTRIFUGA ZENIT.pdf",
    page: 3,
    crop: { left: 71, top: 545, width: 1519, height: 398 },
    out: "bomba-centrifuga-solar-cobre-1hp-conexion.png",
  },
];

async function main() {
  mkdirSync(OUT, { recursive: true });

  for (const [erpCode, slug] of Object.entries(photos)) {
    // Copia byte a byte: next/image genera AVIF/WebP al servir.
    copyFileSync(path.join(SOURCE, `${erpCode}-1.png`), path.join(OUT, `${slug}.png`));
    console.log(`foto  ${erpCode} → ${slug}.png`);
  }

  const tmp = mkdtempSync(path.join(tmpdir(), "zenit-pdf-"));
  try {
    for (const job of pdfCrops) {
      const prefix = path.join(tmp, `p${job.page}-${job.out}`);
      execFileSync(PDFTOPPM, [
        "-r", String(DPI),
        "-f", String(job.page),
        "-l", String(job.page),
        "-png", "-singlefile",
        path.join(SOURCE, job.pdf),
        prefix,
      ]);
      await sharp(`${prefix}.png`)
        .extract(job.crop)
        .png({ compressionLevel: 9 })
        .toFile(path.join(OUT, job.out));
      console.log(`pdf   ${job.pdf} p.${job.page} → ${job.out}`);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

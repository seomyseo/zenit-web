/**
 * Favicon e íconos de la app a partir del águila del logo oficial.
 *
 *   public/brand/zenit-color.svg (los 4 primeros trazos: 2 franjas verdes, cuerpo y ojo)
 *   → public/icon.svg, public/favicon.ico (16/32/48), public/apple-touch-icon.png (180),
 *     public/icon-192.png, public/icon-512.png y public/manifest.webmanifest
 *
 * No se redibuja ni se recolorea nada: se copian los trazos tal cual y solo se recorta
 * con el viewBox. El águila completa es muy ancha (2,7:1) y a 16 px no se lee, así que se
 * encuadra la cabeza con las dos franjas del ala. Va sobre un cuadro blanco (el fondo
 * que el manual pide para el logo a color) para que se vea en pestañas claras y oscuras.
 *
 * Uso: pnpm assets:icons
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { site } from "../content/site";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const LOGO = path.join(PUBLIC, "brand", "zenit-color.svg");

/** Recorte cuadrado (unidades del SVG del logo): cabeza y franjas del ala. */
const CROP = { x: 20, y: 29, size: 56 };
/** Para los íconos grandes (pantalla de inicio) se deja más aire alrededor. */
const PADDED = { x: 13, y: 22, size: 70 };

const eagle = (readFileSync(LOGO, "utf8").match(/<path [^>]*\/>/g) ?? []).slice(0, 4);
if (eagle.length !== 4) throw new Error("No se encontraron los trazos del águila en zenit-color.svg");

function svg(box: { x: number; y: number; size: number }, radius: number): string {
  const { x, y, size } = box;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${size} ${size}">`,
    `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * radius}" fill="#ffffff"/>`,
    ...eagle,
    "</svg>",
    "",
  ].join("\n");
}

const png = (source: string, size: number) =>
  sharp(Buffer.from(source), { density: 1200 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

/** ICO con PNG embebidos (formato válido desde Windows Vista y en todos los navegadores). */
function ico(images: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

async function main() {
  const tile = svg(CROP, 0.18); // pestañas: cuadro redondeado
  const square = svg(PADDED, 0); // iOS y Android aplican su propia máscara

  writeFileSync(path.join(PUBLIC, "icon.svg"), tile);
  const icoImages = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(tile, size) })));
  writeFileSync(path.join(PUBLIC, "favicon.ico"), ico(icoImages));
  writeFileSync(path.join(PUBLIC, "apple-touch-icon.png"), await png(square, 180));
  writeFileSync(path.join(PUBLIC, "icon-192.png"), await png(square, 192));
  writeFileSync(path.join(PUBLIC, "icon-512.png"), await png(square, 512));

  const manifest = {
    name: `${site.name}: ${site.tagline}`,
    short_name: site.name,
    lang: "es-VE",
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#02682e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
  writeFileSync(path.join(PUBLIC, "manifest.webmanifest"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log("✔ icon.svg, favicon.ico (16/32/48), apple-touch-icon.png, icon-192/512.png, manifest.webmanifest");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

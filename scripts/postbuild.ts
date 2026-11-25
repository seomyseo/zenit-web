/**
 * Después de `next build` (exportación estática):
 * 1. Comprueba que out/ tenga todas las páginas esperadas (CLAUDE.md: "comprobar que
 *    out/ se genera completo"). Si falta alguna, falla el build.
 * 2. Si NEXT_PUBLIC_SITE_INDEXABLE no es "true", borra out/sitemap.xml para que el
 *    sitemap no se publique (robots.txt ya sale con Disallow: /).
 */
import { existsSync, readdirSync, readFileSync, renameSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { loadAllProducts } from "../lib/products/load";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "out");
const indexable = process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true";

/**
 * Corrige un error de Next.js al exportar en Windows: los archivos de precarga por
 * segmento deben llamarse `__next.<seg>.<seg>.txt` (convertSegmentPathToStaticExportFilename
 * cambia "/" por "."), pero con rutas de Windows ("\") quedan como carpetas anidadas
 * `__next.<seg>/<seg>.txt` y el navegador recibe 404. En Linux (Docker) no ocurre.
 */
function flattenSegmentFiles(dir: string): number {
  let moved = 0;
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (!statSync(full).isDirectory()) continue;
    if (entry.startsWith("__next.")) {
      const walk = (current: string, prefix: string) => {
        for (const child of readdirSync(current)) {
          const childPath = path.join(current, child);
          if (statSync(childPath).isDirectory()) walk(childPath, `${prefix}.${child}`);
          else {
            renameSync(childPath, path.join(dir, `${prefix}.${child}`));
            moved++;
          }
        }
      };
      walk(full, entry);
      rmSync(full, { recursive: true, force: true });
    } else {
      moved += flattenSegmentFiles(full);
    }
  }
  return moved;
}

const flattened = flattenSegmentFiles(OUT);
if (flattened > 0) console.log(`• ${flattened} archivos de precarga aplanados (error de Next.js en Windows).`);

const published = loadAllProducts(ROOT).filter((p) => p.status === "published");
const expected = [
  "index.html",
  "404.html",
  "productos.html",
  "robots.txt",
  "favicon.ico",
  "icon.svg",
  "apple-touch-icon.png",
  "icon-192.png",
  "icon-512.png",
  "manifest.webmanifest",
  ...published.map((p) => `productos/${p.slug}.html`),
  ...published.flatMap((p) => p.images.map((image) => image.src.replace(/^\//, ""))),
];

const missing = expected.filter((file) => !existsSync(path.join(OUT, file)));
if (missing.length > 0) {
  console.error(`✖ out/ incompleto. Faltan:\n  ${missing.join("\n  ")}`);
  process.exit(1);
}

const robots = readFileSync(path.join(OUT, "robots.txt"), "utf8");
if (indexable) {
  if (!existsSync(path.join(OUT, "sitemap.xml"))) {
    console.error("✖ Falta out/sitemap.xml con el sitio indexable.");
    process.exit(1);
  }
  console.log(`✔ out/ completo (${expected.length} archivos clave). Sitio INDEXABLE: sitemap publicado.`);
} else {
  rmSync(path.join(OUT, "sitemap.xml"), { force: true });
  if (!/Disallow: \/\s*$/m.test(robots)) {
    console.error("✖ robots.txt debería bloquear todo con el sitio no indexable.");
    process.exit(1);
  }
  console.log(
    `✔ out/ completo (${expected.length} archivos clave). Sitio NO indexable: noindex, robots Disallow: / y sin sitemap.`,
  );
}

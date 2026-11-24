/**
 * Capturas de página completa para revisión de diseño (no son pruebas).
 * Levanta `next start` sobre el build actual, recorre la página para disparar
 * las animaciones de entrada y guarda PNG en .screenshots/ (ignorada por git).
 *
 * Uso: pnpm build && pnpm capture [ruta]   (por defecto "/")
 */
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";

const PORT = 3200;
const BASE = `http://localhost:${PORT}`;
const ROUTE = process.argv[2] ?? "/";
const OUT = path.resolve(import.meta.dirname, "..", ".screenshots");
const slug = ROUTE === "/" ? "home" : ROUTE.replace(/^\/|\/$/g, "").replaceAll("/", "_");

async function waitForServer(url: string, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // aún no responde
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`El servidor no respondió en ${url}`);
}

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  // next se lanza directo con node (sin shell) para poder cerrarlo con certeza al terminar.
  const nextBin = path.resolve(import.meta.dirname, "..", "node_modules", "next", "dist", "bin", "next");
  const server = spawn(process.execPath, [nextBin, "start", "--port", String(PORT)], {
    stdio: "ignore",
  });
  try {
    await waitForServer(BASE + ROUTE);
    const browser = await chromium.launch();
    for (const width of [360, 1440]) {
      const page = await browser.newPage({
        viewport: { width, height: width === 360 ? 780 : 900 },
        deviceScaleFactor: width === 360 ? 2 : 1,
      });
      await page.goto(BASE + ROUTE, { waitUntil: "networkidle" });
      await scrollThrough(page);
      // En capturas de página completa el header sticky queda a mitad de página: se fija arriba.
      await page.addStyleTag({ content: "header.sticky { position: relative !important; }" });
      const file = path.join(OUT, `${slug}-${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(file);

      if (width === 360 && ROUTE === "/") {
        await page.getByRole("button", { name: "Abrir menú" }).click();
        await page.getByRole("dialog").waitFor();
        await page.waitForTimeout(500);
        const menu = path.join(OUT, `${slug}-360-menu.png`);
        await page.screenshot({ path: menu });
        console.log(menu);
      }
      await page.close();
    }
    await browser.close();
  } finally {
    if (server.pid) {
      if (process.platform === "win32") {
        spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
      } else {
        server.kill();
      }
    }
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

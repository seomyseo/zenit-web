// Sirve out/ en local con las mismas reglas que nginx (deploy/nginx.conf):
// try_files $uri $uri.html $uri/ =404 y página 404 propia. Solo para revisar y para
// las pruebas: en producción sirve nginx.
//
// Con --api <url>, reenvía /api/ a ese servicio (como hace Traefik con zenit-api).
//
// Uso: pnpm start [--port 3000] [--api http://localhost:3001]
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer, request as httpRequest } from "node:http";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..", "out");
const portArg = process.argv.indexOf("--port");
const PORT = Number(portArg > -1 ? process.argv[portArg + 1] : (process.env.PORT ?? 3000));
const apiArg = process.argv.indexOf("--api");
const API = apiArg > -1 ? new URL(process.argv[apiArg + 1]) : null;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2",
};

function resolve(urlPath) {
  const clean = path.normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const base = path.join(ROOT, clean);
  if (!base.startsWith(ROOT)) return null;
  const candidates = [base, `${base}.html`, path.join(base, "index.html")];
  return candidates.find((file) => existsSync(file) && statSync(file).isFile()) ?? null;
}

if (!existsSync(ROOT)) {
  console.error("No existe out/. Ejecuta primero: pnpm build");
  process.exit(1);
}

function proxy(req, res) {
  const upstream = httpRequest(
    {
      hostname: API.hostname,
      port: API.port,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, "x-forwarded-for": req.headers["x-forwarded-for"] ?? req.socket.remoteAddress },
    },
    (response) => {
      res.writeHead(response.statusCode ?? 502, response.headers);
      response.pipe(res);
    },
  );
  upstream.on("error", () => {
    res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad Gateway");
  });
  req.pipe(upstream);
}

createServer((req, res) => {
  if (req.url?.startsWith("/api/")) {
    if (API) return proxy(req, res);
    // Sin servicio: igual que Traefik sin zenit-api arriba.
    res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Bad Gateway");
  }
  const file = resolve(req.url ?? "/");
  const target = file ?? path.join(ROOT, "404.html");
  res.writeHead(file ? 200 : 404, { "Content-Type": TYPES[path.extname(target)] ?? "application/octet-stream" });
  createReadStream(target).pipe(res);
}).listen(PORT, () => {
  console.log(`Sirviendo out/ en http://localhost:${PORT}${API ? ` (/api/ → ${API.origin})` : ""}`);
});

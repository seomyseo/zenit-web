// Webhook simulado para las pruebas (sustituye al flujo de n8n).
// POST /hook  → guarda el lead; responde 500 si el nombre contiene "FALLA".
// GET  /leads → devuelve los leads recibidos.
import { createServer } from "node:http";

const port = Number(process.env.MOCK_WEBHOOK_PORT ?? 3101);
const leads = [];

createServer((req, res) => {
  if (req.method === "POST" && req.url === "/hook") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const lead = JSON.parse(body);
      leads.push({ ...lead, _auth: req.headers.authorization ?? null });
      const fail = String(lead.name).includes("FALLA");
      res.writeHead(fail ? 500 : 200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: !fail }));
    });
    return;
  }
  if (req.method === "GET" && req.url === "/leads") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(leads));
    return;
  }
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200);
    res.end("ok");
    return;
  }
  res.writeHead(404);
  res.end();
}).listen(port);

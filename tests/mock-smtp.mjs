// SMTP simulado para las pruebas del servicio zenit-api.
// - Acepta correo sin TLS ni autenticación y lo guarda en memoria.
// - Si el mensaje contiene "FALLA-SMTP", responde 554 al final de DATA (envío fallido).
// - GET http://localhost:<http>/messages devuelve los mensajes ya decodificados.
//
// Uso: node tests/mock-smtp.mjs --smtp 2525 --http 2526
import { createServer as createHttpServer } from "node:http";
import { createServer as createTcpServer } from "node:net";

const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return Number(index > -1 ? process.argv[index + 1] : fallback);
};
const SMTP_PORT = arg("--smtp", 2525);
const HTTP_PORT = arg("--http", 2526);

/** @type {{ from: string, to: string[], headers: Record<string, string>, text: string, html: string, raw: string }[]} */
const messages = [];

function decodeQuotedPrintable(value) {
  const bytes = value
    .replace(/=\r?\n/g, "")
    .replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  return Buffer.from(bytes, "latin1").toString("utf8");
}

function decodeBody(body, encoding = "") {
  if (/base64/i.test(encoding)) return Buffer.from(body.replace(/\s+/g, ""), "base64").toString("utf8");
  if (/quoted-printable/i.test(encoding)) return decodeQuotedPrintable(body);
  return body;
}

/** Cabeceras de un bloque MIME (con líneas continuadas), en minúsculas. */
function parseHeaders(block) {
  const headers = {};
  for (const line of block.replace(/\r?\n[ \t]+/g, " ").split(/\r?\n/)) {
    const index = line.indexOf(":");
    if (index > 0) headers[line.slice(0, index).trim().toLowerCase()] = line.slice(index + 1).trim();
  }
  return headers;
}

/** Decodifica palabras MIME (=?UTF-8?Q?...?= / =?UTF-8?B?...?=) de las cabeceras. */
function decodeWords(value) {
  // RFC 2047: el espacio entre dos palabras codificadas seguidas no forma parte del texto.
  return value.replace(/(\?=)\s+(?==\?)/g, "$1").replace(/=\?utf-8\?([qb])\?([^?]*)\?=/gi, (_, type, text) =>
    type.toLowerCase() === "b"
      ? Buffer.from(text, "base64").toString("utf8")
      : decodeQuotedPrintable(text.replace(/_/g, " ")),
  );
}

function parseMessage(raw) {
  const split = raw.search(/\r?\n\r?\n/);
  const headers = parseHeaders(raw.slice(0, split));
  const body = raw.slice(split).replace(/^\r?\n\r?\n/, "");
  const result = { headers: {}, text: "", html: "" };
  for (const [key, value] of Object.entries(headers)) result.headers[key] = decodeWords(value);

  const boundary = /boundary="?([^";]+)"?/i.exec(headers["content-type"] ?? "")?.[1];
  const parts = boundary
    ? body.split(`--${boundary}`).slice(1, -1)
    : [`Content-Type: ${headers["content-type"]}\r\nContent-Transfer-Encoding: ${headers["content-transfer-encoding"] ?? ""}\r\n\r\n${body}`];
  for (const part of parts) {
    const cut = part.search(/\r?\n\r?\n/);
    const partHeaders = parseHeaders(part.slice(0, cut));
    const content = decodeBody(part.slice(cut).replace(/^\r?\n\r?\n/, "").replace(/\r?\n$/, ""), partHeaders["content-transfer-encoding"]);
    if (/text\/html/i.test(partHeaders["content-type"] ?? "")) result.html = content;
    else if (/text\/plain/i.test(partHeaders["content-type"] ?? "")) result.text = content;
  }
  return result;
}

createTcpServer((socket) => {
  let buffer = "";
  let inData = false;
  let envelope = { from: "", to: [] };
  const write = (line) => socket.write(`${line}\r\n`);
  write("220 mock-smtp listo");

  socket.on("data", (chunk) => {
    buffer += chunk.toString("latin1");
    while (true) {
      if (inData) {
        const end = buffer.indexOf("\r\n.\r\n");
        if (end === -1) return;
        const raw = Buffer.from(buffer.slice(0, end), "latin1").toString("utf8").replace(/^\.\./gm, ".");
        buffer = buffer.slice(end + 5);
        inData = false;
        const parsed = parseMessage(raw);
        if ((parsed.text + parsed.html + raw).includes("FALLA-SMTP")) {
          write("554 Rechazado por la prueba");
        } else {
          messages.push({ ...envelope, ...parsed, raw });
          write("250 OK en cola");
        }
        envelope = { from: "", to: [] };
        continue;
      }
      const lineEnd = buffer.indexOf("\r\n");
      if (lineEnd === -1) return;
      const line = buffer.slice(0, lineEnd);
      buffer = buffer.slice(lineEnd + 2);
      const command = line.slice(0, 4).toUpperCase();
      if (command === "EHLO" || command === "HELO") {
        write("250-mock-smtp");
        write("250 8BITMIME");
      } else if (command === "MAIL") {
        envelope.from = /<([^>]*)>/.exec(line)?.[1] ?? "";
        write("250 OK");
      } else if (command === "RCPT") {
        envelope.to.push(/<([^>]*)>/.exec(line)?.[1] ?? "");
        write("250 OK");
      } else if (command === "DATA") {
        inData = true;
        write("354 Termina con <CRLF>.<CRLF>");
      } else if (command === "QUIT") {
        write("221 Adiós");
        socket.end();
        return;
      } else {
        write("250 OK");
      }
    }
  });
  socket.on("error", () => {});
}).listen(SMTP_PORT, "127.0.0.1");

createHttpServer((req, res) => {
  if (req.url === "/messages") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(messages));
    return;
  }
  res.writeHead(404);
  res.end();
}).listen(HTTP_PORT, () => {
  console.log(`SMTP simulado en 127.0.0.1:${SMTP_PORT}; mensajes en http://localhost:${HTTP_PORT}/messages`);
});

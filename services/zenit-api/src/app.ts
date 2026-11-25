import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { site } from "@/content/site";
import {
  CONTACT_ENDPOINT,
  CONTACT_FIELD_MESSAGES,
  type ContactField,
  type ContactResponse,
} from "@/lib/contact/fields";
import { contactInputSchema } from "@/lib/contact/schema";
import { buildContactEmail, type ContactEmail } from "./email";
import { clientIp, createRateLimiter } from "./rate-limit";

/**
 * Servicio de contacto: POST /api/contact → correo a mercadeo. Sin base de datos y sin
 * guardar nada: valida, arma el correo y lo envía. Errores genéricos hacia el cliente y
 * logs sin datos personales (ni teléfonos, ni correos, ni IP).
 */

export type OutgoingMail = ContactEmail & { replyTo: { name: string; address: string } };

export type ContactAppOptions = {
  /** Envía el correo (nodemailer en producción; se inyecta en las pruebas). */
  send: (mail: OutgoingMail) => Promise<void>;
  rateLimit: { max: number; windowMs: number };
  /** Tamaño máximo del cuerpo en bytes. */
  maxBodyBytes?: number;
  log?: (line: string) => void;
};

const HEALTH_ENDPOINT = "/api/health";

class BodyTooLargeError extends Error {}

function readBody(req: IncomingMessage, limit: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const declared = Number(req.headers["content-length"]);
    if (Number.isFinite(declared) && declared > limit) {
      reject(new BodyTooLargeError());
      return;
    }
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > limit) {
        req.pause();
        reject(new BodyTooLargeError());
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function reply(res: ServerResponse, status: number, body: ContactResponse | { ok: true; status: string }, headers: Record<string, string> = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...headers,
  });
  res.end(JSON.stringify(body));
}

export function createContactApp({ send, rateLimit, maxBodyBytes = 10_000, log = console.log }: ContactAppOptions): Server {
  const errors = site.leadForm.errors;
  const checkRateLimit = createRateLimiter(rateLimit);

  async function handleContact(req: IncomingMessage, res: ServerResponse) {
    const ip = clientIp(req.headers["x-forwarded-for"], req.socket.remoteAddress);
    const { allowed, retryAfter } = checkRateLimit(ip);
    if (!allowed) {
      log("[contact] 429 límite de intentos");
      reply(res, 429, { ok: false, error: errors.rateLimited }, { "Retry-After": String(retryAfter) });
      return;
    }

    if (!req.headers["content-type"]?.toLowerCase().startsWith("application/json")) {
      reply(res, 415, { ok: false, error: errors.generic });
      return;
    }

    let raw: string;
    try {
      raw = await readBody(req, maxBodyBytes);
    } catch (error) {
      if (error instanceof BodyTooLargeError) {
        log("[contact] 413 cuerpo demasiado grande");
        reply(res, 413, { ok: false, error: errors.generic }, { Connection: "close" });
      } else {
        reply(res, 400, { ok: false, error: errors.generic });
      }
      return;
    }

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      reply(res, 400, { ok: false, error: errors.generic });
      return;
    }

    const parsed = contactInputSchema.safeParse(json);
    if (!parsed.success) {
      const fields: Partial<Record<ContactField, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && field in CONTACT_FIELD_MESSAGES) {
          fields[field as ContactField] = CONTACT_FIELD_MESSAGES[field as ContactField];
        }
      }
      log("[contact] 422 validación");
      reply(res, 422, { ok: false, error: errors.fields, fields });
      return;
    }

    const input = parsed.data;

    // Honeypot lleno: se responde como éxito para no dar pistas, pero no se envía nada.
    if (input.website) {
      log("[contact] 200 honeypot (no se envía)");
      reply(res, 200, { ok: true });
      return;
    }

    const email = buildContactEmail(input, new Date());
    try {
      await send({ ...email, replyTo: { name: input.name, address: input.email } });
    } catch (error) {
      // Solo el tipo de error: el mensaje del servidor SMTP puede incluir direcciones.
      const code = error && typeof error === "object" && "code" in error ? String(error.code) : "desconocido";
      log(`[contact] 502 fallo de envío SMTP (${code})`);
      reply(res, 502, { ok: false, error: errors.generic });
      return;
    }

    log("[contact] 200 enviado");
    reply(res, 200, { ok: true });
  }

  const server = createServer((req, res) => {
    const pathname = (req.url ?? "/").split("?")[0];

    if (pathname === HEALTH_ENDPOINT && (req.method === "GET" || req.method === "HEAD")) {
      reply(res, 200, { ok: true, status: "up" });
      return;
    }

    if (pathname === CONTACT_ENDPOINT) {
      if (req.method !== "POST") {
        reply(res, 405, { ok: false, error: errors.generic }, { Allow: "POST" });
        return;
      }
      handleContact(req, res).catch(() => {
        log("[contact] 500 error inesperado");
        if (!res.headersSent) reply(res, 500, { ok: false, error: errors.generic });
      });
      return;
    }

    reply(res, 404, { ok: false, error: errors.generic });
  });

  // Peticiones lentas o colgadas no ocupan el proceso indefinidamente.
  server.headersTimeout = 10_000;
  server.requestTimeout = 20_000;
  return server;
}

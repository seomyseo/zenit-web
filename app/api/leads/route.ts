import { NextResponse } from "next/server";
import { site } from "@/content/site";
import { getServerEnv } from "@/lib/env";
import { checkRateLimit, clientIp } from "@/lib/leads/rate-limit";
import {
  LEAD_FIELD_MESSAGES,
  leadInputSchema,
  type Lead,
  type LeadField,
  type LeadResponse,
} from "@/lib/leads/schema";
import { getPublishedProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 10_000;
const WEBHOOK_TIMEOUT_MS = 8_000;

function reply(body: LeadResponse, status: number, headers?: HeadersInit) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export async function POST(request: Request) {
  const errors = site.leadForm.errors;

  const { allowed, retryAfter } = checkRateLimit(clientIp(request.headers));
  if (!allowed) {
    return reply(
      { ok: false, error: "Recibimos varios intentos seguidos. Espera unos minutos e inténtalo de nuevo." },
      429,
      { "Retry-After": String(retryAfter) },
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return reply({ ok: false, error: errors.generic }, 415);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return reply({ ok: false, error: errors.generic }, 413);
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return reply({ ok: false, error: errors.generic }, 400);
  }

  const parsed = leadInputSchema.safeParse(json);
  if (!parsed.success) {
    const fields: Partial<Record<LeadField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && field in LEAD_FIELD_MESSAGES) {
        fields[field as LeadField] = LEAD_FIELD_MESSAGES[field as LeadField];
      }
    }
    return reply({ ok: false, error: errors.fields, fields }, 422);
  }

  const input = parsed.data;

  // Honeypot lleno: se responde como éxito para no dar pistas, pero no se envía nada.
  if (input.website) {
    return reply({ ok: true }, 200);
  }

  const known = new Set(getPublishedProducts().map((p) => p.erpCode));
  if (input.product_interest.some((code) => !known.has(code))) {
    return reply(
      { ok: false, error: errors.fields, fields: { product_interest: LEAD_FIELD_MESSAGES.product_interest } },
      422,
    );
  }

  const lead: Lead = {
    created_at: new Date().toISOString(),
    origin: "zenit.com.ve",
    name: input.name,
    company: input.company,
    city: input.city,
    phone: input.phone,
    email: input.email,
    message: input.message,
    product_interest: [...new Set(input.product_interest)],
    consent: input.consent,
  };

  const { LEADS_WEBHOOK_URL, LEADS_WEBHOOK_TOKEN } = getServerEnv();

  if (!LEADS_WEBHOOK_URL) {
    if (process.env.NODE_ENV !== "production") {
      // Sin datos personales en el log (CLAUDE.md).
      console.info(
        `[leads] LEADS_WEBHOOK_URL no configurada: lead aceptado en desarrollo (${lead.product_interest.length} productos de interés).`,
      );
      return reply({ ok: true }, 200);
    }
    console.error("[leads] LEADS_WEBHOOK_URL no configurada en producción.");
    return reply({ ok: false, error: errors.generic }, 503);
  }

  try {
    const response = await fetch(LEADS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(LEADS_WEBHOOK_TOKEN ? { Authorization: `Bearer ${LEADS_WEBHOOK_TOKEN}` } : {}),
      },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error(`[leads] El webhook respondió ${response.status}.`);
      return reply({ ok: false, error: errors.generic }, 502);
    }
  } catch (error) {
    const reason = error instanceof Error ? error.name : "desconocido";
    console.error(`[leads] No se pudo contactar el webhook (${reason}).`);
    return reply({ ok: false, error: errors.generic }, 502);
  }

  return reply({ ok: true }, 200);
}

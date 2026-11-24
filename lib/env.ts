import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalUrl = z.preprocess(emptyToUndefined, z.url().optional());

/** Variables disponibles en el cliente (prefijo NEXT_PUBLIC_). */
const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    emptyToUndefined,
    z.url().default("https://zenit.com.ve"),
  ),
  NEXT_PUBLIC_WHATSAPP_URL: optionalUrl,
});

/** Variables solo de servidor. No importar desde componentes de cliente. */
const serverSchema = z.object({
  LEADS_WEBHOOK_URL: optionalUrl,
  /** Opcional: se envía como "Authorization: Bearer <token>" para que n8n verifique el origen. */
  LEADS_WEBHOOK_TOKEN: z.preprocess(emptyToUndefined, z.string().min(16).optional()),
});

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_WHATSAPP_URL: process.env.NEXT_PUBLIC_WHATSAPP_URL,
});

export function getServerEnv() {
  return serverSchema.parse({
    LEADS_WEBHOOK_URL: process.env.LEADS_WEBHOOK_URL,
    LEADS_WEBHOOK_TOKEN: process.env.LEADS_WEBHOOK_TOKEN,
  });
}

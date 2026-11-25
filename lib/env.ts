import { z } from "zod";

/**
 * Variables del sitio. Esta fase es 100 % estática (nginx sirve out/): todas son
 * NEXT_PUBLIC_ y se incrustan al compilar (build args en Docker). No hay secretos.
 */

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.preprocess(emptyToUndefined, z.url().default("https://zenit.com.ve")),
  /** Enlace de WhatsApp comercial (https://wa.me/58…). Si falta, el CTA usa Instagram. */
  NEXT_PUBLIC_WHATSAPP_URL: z.preprocess(emptyToUndefined, z.url().optional()),
  /** Solo "true" permite indexar (robots y meta). Cualquier otro valor: noindex. */
  NEXT_PUBLIC_SITE_INDEXABLE: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .optional()
      .transform((value) => value === "true"),
  ),
});

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_WHATSAPP_URL: process.env.NEXT_PUBLIC_WHATSAPP_URL,
  NEXT_PUBLIC_SITE_INDEXABLE: process.env.NEXT_PUBLIC_SITE_INDEXABLE,
});

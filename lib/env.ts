import { z } from "zod";

/**
 * Variables públicas del sitio. Son NEXT_PUBLIC_ y se incrustan al compilar (build args
 * en Docker). No hay secretos aquí: las credenciales SMTP son del servicio zenit-api y
 * solo existen en el entorno de ese contenedor (services/zenit-api).
 */

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

/** WhatsApp comercial de Zenit (CLAUDE.md, "Captación"). La variable puede sustituirlo. */
export const DEFAULT_WHATSAPP_URL = "https://wa.me/584244721107";

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.preprocess(emptyToUndefined, z.url().default("https://zenit.com.ve")),
  /** Enlace de WhatsApp comercial, formato https://wa.me/58XXXXXXXXXX. */
  NEXT_PUBLIC_WHATSAPP_URL: z.preprocess(
    emptyToUndefined,
    z
      .url()
      .refine((value) => /^https:\/\/wa\.me\/\d{8,15}$/.test(value), "Formato: https://wa.me/58XXXXXXXXXX")
      .default(DEFAULT_WHATSAPP_URL),
  ),
  /** Solo "true" permite indexar (robots y meta). Por defecto, false: noindex. */
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

/**
 * Campos, límites y respuestas del formulario de contacto. Sin dependencias: lo usan el
 * navegador (ContactForm) y el servicio zenit-api (services/zenit-api).
 */
import { site } from "@/content/site";

export type ContactField =
  | "name"
  | "company"
  | "city"
  | "phone"
  | "email"
  | "message"
  | "product_interest"
  | "consent";

/** Ruta del servicio (Traefik envía /api/ al contenedor zenit-api). */
export const CONTACT_ENDPOINT = "/api/contact";

/** Largo máximo del mensaje libre. */
export const CONTACT_MESSAGE_MAX = 1000;

/** Mensajes en español por campo (nunca se devuelven detalles internos de Zod). */
export const CONTACT_FIELD_MESSAGES: Record<ContactField, string> = site.leadForm.fieldErrors;

export type ContactResponse =
  | { ok: true }
  | { ok: false; error: string; fields?: Partial<Record<ContactField, string>> };

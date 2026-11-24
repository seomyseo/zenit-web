/**
 * Mensajes y tipos del formulario de leads, sin dependencias (se usan en el cliente).
 */

export type LeadField =
  | "name"
  | "company"
  | "city"
  | "phone"
  | "email"
  | "message"
  | "product_interest"
  | "consent";

/** Largo máximo del mensaje libre. */
export const LEAD_MESSAGE_MAX = 1000;

/** Mensajes en español por campo (no se devuelven detalles internos de Zod). */
export const LEAD_FIELD_MESSAGES: Record<LeadField, string> = {
  name: "Escribe tu nombre y apellido.",
  company: "Escribe el nombre de tu empresa o ferretería.",
  city: "Escribe tu ciudad.",
  phone: "Escribe un teléfono válido, con código de área.",
  email: "Escribe un correo electrónico válido.",
  message: "El mensaje no puede pasar de 1000 caracteres.",
  product_interest: "Revisa los productos seleccionados.",
  consent: "Debes aceptar que Inversiones Lefre te contacte.",
};

export type LeadResponse =
  | { ok: true }
  | { ok: false; error: string; fields?: Partial<Record<LeadField, string>> };

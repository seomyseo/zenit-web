import { z } from "zod";
import { CONTACT_MESSAGE_MAX, type ContactField } from "./fields";

/** Validación en servidor del formulario de contacto (servicio zenit-api). */

const text = (min: number, max: number) => z.string().trim().min(min).max(max);

export const contactInputSchema = z.object({
  name: text(2, 100),
  company: text(2, 120),
  city: text(2, 80),
  phone: z
    .string()
    .trim()
    .max(25)
    .regex(/^\+?[\d\s().-]+$/)
    .refine((value) => {
      const digits = value.replace(/\D/g, "").length;
      return digits >= 7 && digits <= 15;
    }),
  email: z.string().trim().toLowerCase().max(160).pipe(z.email()),
  /** Mensaje libre, opcional. */
  message: z.string().trim().max(CONTACT_MESSAGE_MAX).default(""),
  /** erpCode del producto desde cuya ficha se llegó (opcional). */
  product_interest: z.array(z.string().regex(/^\d{4}-\d{4}$/)).max(5).default([]),
  consent: z.literal(true),
  /** Honeypot: las personas no lo ven; si llega con contenido, es un bot. */
  website: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactInputSchema>;

// Comprobación en compilación: los campos del esquema coinciden con ContactField.
type SchemaFields = Exclude<keyof ContactInput, "website">;
type _FieldsMatch = SchemaFields extends ContactField ? (ContactField extends SchemaFields ? true : never) : never;
export const _contactFieldsMatch: _FieldsMatch = true;

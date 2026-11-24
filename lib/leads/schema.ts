import { z } from "zod";
import type { LeadField } from "./messages";

export { LEAD_FIELD_MESSAGES, type LeadField, type LeadResponse } from "./messages";

/**
 * Datos que envía el formulario de captación. Los mismos campos irán a la tabla
 * compartida con lefre.com.ve en la Fase 3 (BRIEF, sección 7).
 */

const text = (min: number, max: number) => z.string().trim().min(min).max(max);

export const leadInputSchema = z.object({
  name: text(2, 100),
  company: text(2, 120),
  city: text(2, 80),
  phone: z
    .string()
    .trim()
    .max(25)
    .regex(/^\+?[\d\s().-]+$/)
    .refine((value) => value.replace(/\D/g, "").length >= 7 && value.replace(/\D/g, "").length <= 15),
  email: z.string().trim().toLowerCase().max(160).pipe(z.email()),
  product_interest: z.array(z.string().regex(/^\d{4}-\d{4}$/)).max(20).default([]),
  consent: z.literal(true),
  /** Honeypot: los humanos no lo ven; si llega con contenido, es un bot. */
  website: z.string().max(200).optional(),
});

export type LeadInput = z.infer<typeof leadInputSchema>;

/** Lead tal como se envía al webhook. */
export type Lead = {
  created_at: string;
  origin: "zenit.com.ve";
  name: string;
  company: string;
  city: string;
  phone: string;
  email: string;
  product_interest: string[];
  consent: boolean;
};


// Comprobación en compilación: los campos del esquema coinciden con LeadField.
type _FieldsMatch = Exclude<keyof LeadInput, "website"> extends LeadField
  ? LeadField extends Exclude<keyof LeadInput, "website">
    ? true
    : never
  : never;
export const _leadFieldsMatch: _FieldsMatch = true;

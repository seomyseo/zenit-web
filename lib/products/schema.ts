import { z } from "zod";

/** Esquema de producto (BRIEF-ZENIT.md, sección 5). Se mapea a Postgres en la Fase 3. */

const nonEmpty = z.string().trim().min(1);

const publicAsset = z
  .string()
  .regex(/^\/products\/[a-z0-9-]+\.(png|jpg|jpeg|webp|avif|pdf)$/, {
    message: "debe ser una ruta bajo /products/ (public/products/)",
  });

export const productGroupSchema = z.enum(["agricola", "automotriz"]);

export const productFamilySchema = z.enum([
  "centrifuga",
  "periferica",
  "sumergible",
  "presostato",
  "control",
  "refrigerante",
]);

const erpCode = z.string().regex(/^\d{4}-\d{4}$/, { message: "formato 0000-0000" });

export const productSchema = z.strictObject({
  erpCode,
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "kebab-case" }),
  model: nonEmpty.optional(),
  name: nonEmpty,
  group: productGroupSchema,
  family: productFamilySchema,
  variantOf: erpCode.optional(),
  shortDescription: nonEmpty,
  features: z.array(nonEmpty).min(1).optional(),
  applications: z.array(nonEmpty).min(1).optional(),
  includes: z.array(nonEmpty).min(1).optional(),
  /** Texto de garantía. Solo bombas por ahora (CLAUDE.md). */
  warranty: nonEmpty.optional(),
  specGroups: z
    .array(
      z.strictObject({
        title: nonEmpty,
        rows: z.array(z.strictObject({ label: nonEmpty, value: nonEmpty })).min(1),
      }),
    )
    .min(1)
    .optional(),
  images: z.array(z.strictObject({ src: publicAsset, alt: nonEmpty })).min(1),
  files: z
    .array(
      z.strictObject({
        kind: z.enum(["datasheet", "curve", "wiring"]),
        src: publicAsset,
        label: nonEmpty,
      }),
    )
    .min(1)
    .optional(),
  status: z.enum(["published", "draft"]),
});

export type Product = z.infer<typeof productSchema>;
export type ProductGroup = z.infer<typeof productGroupSchema>;
export type ProductFamily = z.infer<typeof productFamilySchema>;

export const GROUP_LABELS: Record<ProductGroup, string> = {
  agricola: "Agrícola",
  automotriz: "Automotriz",
};

/** Orden de los grupos en el catálogo (mismo orden del ERP). */
export const GROUP_ORDER: readonly ProductGroup[] = ["agricola", "automotriz"];

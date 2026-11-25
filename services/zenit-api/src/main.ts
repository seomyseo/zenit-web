import nodemailer from "nodemailer";
import { z } from "zod";
import { createContactApp } from "./app";

/**
 * Arranque del contenedor zenit-api. Variables de EJECUCIÓN (no de build), solo en el
 * .env del servidor: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, MAIL_TO.
 * Si falta algo obligatorio, el proceso termina con un mensaje claro (sin mostrar valores).
 */

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;
const optional = <T extends z.ZodType>(schema: T) => z.preprocess(emptyToUndefined, schema);

const envSchema = z
  .object({
    SMTP_HOST: z.string().trim().min(1),
    SMTP_PORT: optional(z.coerce.number().int().min(1).max(65535).default(587)),
    SMTP_USER: optional(z.string().optional()),
    SMTP_PASS: optional(z.string().optional()),
    /** Remitente de un dominio con correo propio (p. ej. @lefre.com.ve), nunca @zenit.com.ve. */
    MAIL_FROM: z.string().trim().min(3),
    MAIL_TO: optional(z.string().trim().default("mercadeo@lefre.com.ve")),
    PORT: optional(z.coerce.number().int().default(3001)),
    RATE_LIMIT_MAX: optional(z.coerce.number().int().min(1).default(5)),
    RATE_LIMIT_WINDOW_MINUTES: optional(z.coerce.number().min(1).default(10)),
  })
  .refine((env) => Boolean(env.SMTP_USER) === Boolean(env.SMTP_PASS), {
    message: "SMTP_USER y SMTP_PASS van juntos",
    path: ["SMTP_PASS"],
  });

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const names = [...new Set(parsed.error.issues.map((issue) => issue.path.join(".")))];
  console.error(`[zenit-api] Configuración incompleta o inválida: ${names.join(", ")}. Revisa el .env del servidor.`);
  process.exit(1);
}
const env = parsed.data;

if (/@zenit\.com\.ve>?\s*$/i.test(env.MAIL_FROM)) {
  console.warn("[zenit-api] Aviso: MAIL_FROM usa @zenit.com.ve, que no tiene correo ni SPF/DKIM: los mensajes pueden caer en spam.");
}

const secure = env.SMTP_PORT === 465;
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure,
  // Con credenciales, nunca se envían sin cifrar: STARTTLS obligatorio si no es el puerto 465.
  requireTLS: !secure && Boolean(env.SMTP_USER),
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,
});

const server = createContactApp({
  rateLimit: { max: env.RATE_LIMIT_MAX, windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60_000 },
  send: async (mail) => {
    await transporter.sendMail({
      from: env.MAIL_FROM,
      to: env.MAIL_TO,
      replyTo: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
  },
});

server.listen(env.PORT, () => {
  console.log(`[zenit-api] Escuchando en el puerto ${env.PORT}`);
  transporter.verify().then(
    () => console.log("[zenit-api] Conexión SMTP verificada"),
    (error: unknown) => {
      const code = error && typeof error === "object" && "code" in error ? String(error.code) : "desconocido";
      console.error(`[zenit-api] No se pudo verificar el SMTP (${code}). Los envíos fallarán hasta corregirlo.`);
    },
  );
});

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5_000).unref();
  });
}

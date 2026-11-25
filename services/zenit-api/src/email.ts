import type { ContactInput } from "@/lib/contact/schema";

/**
 * Correo para mercadeo a partir de un contacto ya validado. Todo el contenido que viene
 * del visitante se escapa en HTML y se limpia de saltos de línea en el asunto.
 */

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]!);
}

/** Una sola línea, sin caracteres de control (evita inyección de cabeceras en el asunto). */
export function singleLine(value: string, max = 80): string {
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export type ContactEmail = { subject: string; text: string; html: string };

export function buildContactEmail(input: ContactInput, receivedAt: Date): ContactEmail {
  const rows: [string, string][] = [
    ["Nombre", input.name],
    ["Empresa", input.company],
    ["Ciudad", input.city],
    ["Teléfono", input.phone],
    ["Correo", input.email],
    ["Producto de interés", input.product_interest.join(", ") || "No indicado"],
    ["Mensaje", input.message || "(sin mensaje)"],
    ["Consentimiento", "Aceptó que Inversiones Lefre lo contacte"],
    ["Recibido", receivedAt.toISOString()],
  ];

  const subject = `Nuevo contacto Zenit: ${singleLine(input.company)} (${singleLine(input.city, 40)})`;

  const text = [
    "Nuevo contacto desde el formulario de zenit.com.ve",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Responder a este correo le escribe directamente al visitante.",
  ].join("\n");

  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><th align="left" valign="top" style="padding:6px 12px 6px 0;color:#575756;font-weight:600;white-space:nowrap">${escapeHtml(label)}</th>` +
        `<td style="padding:6px 0;color:#000000;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  const html =
    `<!doctype html><html lang="es"><body style="font-family:Arial,Helvetica,sans-serif;font-size:14px">` +
    `<p style="color:#02682e;font-weight:700;font-size:16px">Nuevo contacto desde el formulario de zenit.com.ve</p>` +
    `<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">${htmlRows}</table>` +
    `<p style="color:#575756">Responder a este correo le escribe directamente al visitante.</p>` +
    `</body></html>`;

  return { subject, text, html };
}

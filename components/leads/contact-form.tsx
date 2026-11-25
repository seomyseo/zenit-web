"use client";

import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";
import {
  CONTACT_ENDPOINT,
  CONTACT_FIELD_MESSAGES,
  CONTACT_MESSAGE_MAX,
  type ContactField,
  type ContactResponse,
} from "@/lib/contact/fields";
import { cn } from "@/lib/utils";

/**
 * Formulario de contacto. Envía a POST /api/contact (servicio zenit-api), que manda un
 * correo a mercadeo. Aislado: para cambiar el destino (webhook, CRM) basta con cambiar
 * el servicio o CONTACT_ENDPOINT, sin tocar la página.
 *
 * `fallback` es lo que se muestra si el envío falla (el botón de WhatsApp): se recibe
 * desde el servidor para no meter la lógica del enlace en el bundle del cliente.
 */

/** Productos que se pueden precargar desde una ficha (/?producto=<erpCode>#contacto). */
export type ContactProductOption = { erpCode: string; name: string };

type Status = "idle" | "sending" | "success" | "error";
type FieldErrors = Partial<Record<ContactField, string>>;

const TEXT_FIELDS = ["name", "company", "city", "phone", "email"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validación en el navegador con los mismos mensajes que el servidor. */
function validate(data: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const value = (key: string) => String(data.get(key) ?? "").trim();
  if (value("name").length < 2) errors.name = CONTACT_FIELD_MESSAGES.name;
  if (value("company").length < 2) errors.company = CONTACT_FIELD_MESSAGES.company;
  if (value("city").length < 2) errors.city = CONTACT_FIELD_MESSAGES.city;
  const digits = value("phone").replace(/\D/g, "").length;
  if (!/^\+?[\d\s().-]+$/.test(value("phone")) || digits < 7 || digits > 15) {
    errors.phone = CONTACT_FIELD_MESSAGES.phone;
  }
  if (!EMAIL_RE.test(value("email"))) errors.email = CONTACT_FIELD_MESSAGES.email;
  if (value("message").length > CONTACT_MESSAGE_MAX) errors.message = CONTACT_FIELD_MESSAGES.message;
  if (data.get("consent") !== "on") errors.consent = CONTACT_FIELD_MESSAGES.consent;
  return errors;
}

export function ContactForm({
  products,
  fallback,
}: {
  products: ContactProductOption[];
  fallback: React.ReactNode;
}) {
  const t = site.leadForm;
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  /** El envío falló por el servidor o la red (no por los campos): se ofrece WhatsApp. */
  const [sendFailed, setSendFailed] = useState(false);

  // Llegada desde una ficha (/?producto=<erpCode>#contacto): se precarga el mensaje con
  // el producto (editable) y su código viaja en product_interest (campo oculto).
  // Los campos no son controlados: solo se escriben en el DOM al montar.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("producto");
    const product = products.find((p) => p.erpCode === code);
    const form = formRef.current;
    if (!product || !form) return;
    const hidden = form.querySelector<HTMLInputElement>('input[name="product_interest"]');
    const textarea = form.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
    if (hidden) hidden.value = product.erpCode;
    if (textarea && !textarea.value) {
      textarea.value = t.fields.message.prefill.replace("{producto}", product.name);
    }
  }, [products, t.fields.message.prefill]);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  function focusFirstError(errors: FieldErrors) {
    const first = [...TEXT_FIELDS, "message", "consent"].find((f) => errors[f as ContactField]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  function fail(text: string, errors: FieldErrors = {}, unavailable = false) {
    setFieldErrors(errors);
    setStatus("error");
    setMessage(text);
    setSendFailed(unavailable);
    focusFirstError(errors);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const errors = validate(data);
    if (Object.keys(errors).length > 0) {
      fail(t.errors.fields, errors);
      return;
    }

    setStatus("sending");
    setMessage("");
    setFieldErrors({});
    setSendFailed(false);
    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          company: data.get("company"),
          city: data.get("city"),
          phone: data.get("phone"),
          email: data.get("email"),
          message: data.get("message"),
          product_interest: data.getAll("product_interest").filter(Boolean),
          consent: data.get("consent") === "on",
          website: data.get("website") || undefined,
        }),
      });
      const body = (await response.json().catch(() => null)) as ContactResponse | null;
      if (response.ok && body?.ok) {
        setStatus("success");
        formRef.current?.reset();
        return;
      }
      const serverFields = body && !body.ok ? (body.fields ?? {}) : {};
      const hasFieldErrors = Object.keys(serverFields).length > 0;
      fail(body && !body.ok ? body.error : t.errors.generic, serverFields, !hasFieldErrors);
    } catch {
      fail(t.errors.network, {}, true);
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-xl border-2 border-zenit-green bg-zenit-white p-6">
        <CheckCircle2 aria-hidden="true" className="size-10 text-zenit-green" />
        <h3 ref={successRef} tabIndex={-1} className="mt-4 text-xl font-bold text-zenit-black outline-none">
          {t.success.title}
        </h3>
        <p className="mt-2 text-zenit-gray">{t.success.text}</p>
        <Button
          type="button"
          variant="link"
          className="mt-4 h-auto px-0 text-base"
          onClick={() => setStatus("idle")}
        >
          {t.success.again}
        </Button>
      </div>
    );
  }

  const sending = status === "sending";
  const inputClass =
    "mt-2 block w-full rounded-xl border bg-zenit-gray-50 px-4 text-base text-zenit-black transition-[border-color,background-color,box-shadow] duration-200 outline-none focus-visible:border-zenit-green focus-visible:bg-zenit-white focus-visible:ring-4 focus-visible:ring-zenit-green/15 focus-visible:outline-none motion-reduce:transition-none";

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      aria-describedby={`${formId}-status`}
      className="relative"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {TEXT_FIELDS.map((field) => {
          const config = t.fields[field];
          const id = `${formId}-${field}`;
          const error = fieldErrors[field];
          const hint = "hint" in config ? config.hint : undefined;
          return (
            <div key={field} className={cn(field === "email" && "sm:col-span-2")}>
              <label htmlFor={id} className="block text-xs font-semibold tracking-widest text-zenit-gray uppercase">
                {config.label}
              </label>
              <input
                id={id}
                name={field}
                type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                inputMode={field === "phone" ? "tel" : undefined}
                autoComplete={config.autoComplete}
                required
                maxLength={field === "email" ? 160 : 120}
                aria-invalid={error ? true : undefined}
                aria-describedby={cn(hint && `${id}-hint`, error && `${id}-error`) || undefined}
                className={cn(
                  inputClass,
                  "h-12",
                  error ? "border-zenit-black ring-1 ring-zenit-black" : "border-zenit-gray-200",
                )}
              />
              {hint ? (
                <p id={`${id}-hint`} className="mt-1 text-xs text-zenit-gray">
                  {hint}
                </p>
              ) : null}
              {error ? (
                <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-zenit-black">
                  ⚠ {error}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <label htmlFor={`${formId}-message`} className="block text-xs font-semibold tracking-widest text-zenit-gray uppercase">
          {t.fields.message.label}
        </label>
        <textarea
          id={`${formId}-message`}
          name="message"
          rows={4}
          maxLength={CONTACT_MESSAGE_MAX}
          aria-invalid={fieldErrors.message ? true : undefined}
          aria-describedby={cn(`${formId}-message-hint`, fieldErrors.message && `${formId}-message-error`)}
          className={cn(
            inputClass,
            "resize-y py-3",
            fieldErrors.message ? "border-zenit-black ring-1 ring-zenit-black" : "border-zenit-gray-200",
          )}
        />
        <p id={`${formId}-message-hint`} className="mt-1 text-xs text-zenit-gray">
          {t.fields.message.hint}
        </p>
        {fieldErrors.message ? (
          <p id={`${formId}-message-error`} className="mt-1 text-sm font-semibold text-zenit-black">
            ⚠ {fieldErrors.message}
          </p>
        ) : null}
        {/* Código del producto si se llegó desde su ficha (lo escribe el efecto de arriba). */}
        <input type="hidden" name="product_interest" defaultValue="" />
      </div>

      {/* Honeypot: invisible para personas y lectores de pantalla. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${formId}-website`}>Sitio web</label>
        <input id={`${formId}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-6">
        <label htmlFor={`${formId}-consent`} className="flex cursor-pointer items-start gap-3 text-sm text-zenit-black">
          <input
            id={`${formId}-consent`}
            name="consent"
            type="checkbox"
            required
            aria-invalid={fieldErrors.consent ? true : undefined}
            aria-describedby={fieldErrors.consent ? `${formId}-consent-error` : undefined}
            className="mt-0.5 size-5 shrink-0 accent-zenit-green"
          />
          {t.consent}
        </label>
        {fieldErrors.consent ? (
          <p id={`${formId}-consent-error`} className="mt-1 text-sm font-semibold text-zenit-black">
            ⚠ {fieldErrors.consent}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button type="submit" size="xl" disabled={sending} className="group rounded-xl px-8 sm:min-w-56">
          {sending ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
          {sending ? t.sending : t.submit}
          {sending ? null : (
            <ArrowRight
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
            />
          )}
        </Button>
        {sendFailed ? <div data-testid="contact-fallback">{fallback}</div> : null}
      </div>

      <p
        id={`${formId}-status`}
        role={status === "error" ? "alert" : undefined}
        aria-live="polite"
        className={cn("mt-4 text-sm font-semibold text-zenit-black", !message && "sr-only")}
      >
        {message ? `⚠ ${message}` : ""}
      </p>
    </form>
  );
}

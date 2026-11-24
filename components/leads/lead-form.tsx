"use client";

import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { WhatsAppLink } from "@/components/site/whatsapp-link";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";
import { LEAD_FIELD_MESSAGES, type LeadField, type LeadResponse } from "@/lib/leads/messages";
import { cn } from "@/lib/utils";

export type LeadProductOption = { erpCode: string; name: string; groupLabel: string };

type Status = "idle" | "sending" | "success" | "error";
type FieldErrors = Partial<Record<LeadField, string>>;

const TEXT_FIELDS = ["name", "company", "city", "phone", "email"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validación en el navegador con los mismos mensajes que el servidor. */
function validate(data: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const value = (key: string) => String(data.get(key) ?? "").trim();
  if (value("name").length < 2) errors.name = LEAD_FIELD_MESSAGES.name;
  if (value("company").length < 2) errors.company = LEAD_FIELD_MESSAGES.company;
  if (value("city").length < 2) errors.city = LEAD_FIELD_MESSAGES.city;
  const digits = value("phone").replace(/\D/g, "").length;
  if (!/^\+?[\d\s().-]+$/.test(value("phone")) || digits < 7 || digits > 15) {
    errors.phone = LEAD_FIELD_MESSAGES.phone;
  }
  if (!EMAIL_RE.test(value("email"))) errors.email = LEAD_FIELD_MESSAGES.email;
  if (data.get("consent") !== "on") errors.consent = LEAD_FIELD_MESSAGES.consent;
  return errors;
}

export function LeadForm({
  products,
  whatsappUrl,
}: {
  products: LeadProductOption[];
  whatsappUrl?: string;
}) {
  const t = site.leadForm;
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Producto preseleccionado desde la ficha: /?producto=<erpCode>#contacto.
  // Los checkboxes no son controlados: solo se marca el que llega por la URL.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("producto");
    if (!code || !/^\d{4}-\d{4}$/.test(code)) return;
    const input = formRef.current?.querySelector<HTMLInputElement>(
      `input[name="product_interest"][value="${code}"]`,
    );
    if (input) input.checked = true;
  }, []);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const groups = [...new Set(products.map((p) => p.groupLabel))];

  function focusFirstError(errors: FieldErrors) {
    const first = [...TEXT_FIELDS, "consent"].find((f) => errors[f as LeadField]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const errors = validate(data);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setStatus("error");
      setMessage(t.errors.fields);
      focusFirstError(errors);
      return;
    }

    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          company: data.get("company"),
          city: data.get("city"),
          phone: data.get("phone"),
          email: data.get("email"),
          product_interest: data.getAll("product_interest"),
          consent: data.get("consent") === "on",
          website: data.get("website") || undefined,
        }),
      });
      const body = (await response.json().catch(() => null)) as LeadResponse | null;
      if (response.ok && body?.ok) {
        setStatus("success");
        formRef.current?.reset();
        return;
      }
      const serverFields = body && !body.ok ? (body.fields ?? {}) : {};
      setFieldErrors(serverFields);
      setStatus("error");
      setMessage(body && !body.ok ? body.error : t.errors.generic);
      focusFirstError(serverFields);
    } catch {
      setStatus("error");
      setMessage(t.errors.network);
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
  const showWhatsApp = status === "error" && Object.keys(fieldErrors).length === 0;

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
                  "mt-2 block h-12 w-full rounded-xl border bg-zenit-gray-50 px-4 text-base text-zenit-black transition-[border-color,background-color,box-shadow] duration-200 outline-none focus-visible:border-zenit-green focus-visible:bg-zenit-white focus-visible:ring-4 focus-visible:ring-zenit-green/15 focus-visible:outline-none motion-reduce:transition-none",
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

      <fieldset className="mt-6">
        <legend className="text-xs font-semibold tracking-widest text-zenit-gray uppercase">{t.fields.products.label}</legend>
        <p className="mt-1 text-xs text-zenit-gray">{t.fields.products.hint}</p>
        {fieldErrors.product_interest ? (
          <p className="mt-1 text-sm font-semibold text-zenit-black">⚠ {fieldErrors.product_interest}</p>
        ) : null}
        <div className="mt-3 space-y-4">
          {groups.map((group) => (
            <div key={group}>
              <p className="text-xs font-semibold tracking-wide text-zenit-gray uppercase">{group}</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {products
                  .filter((p) => p.groupLabel === group)
                  .map((product) => {
                    const id = `${formId}-p-${product.erpCode}`;
                    return (
                      <li key={product.erpCode}>
                        <label
                          htmlFor={id}
                          className="flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-zenit-gray-200 bg-zenit-gray-50 py-1.5 pr-3.5 pl-2.5 text-sm text-zenit-black transition-colors hover:border-zenit-green/50 has-checked:border-zenit-green has-checked:bg-zenit-green/10 has-focus-visible:outline-3 has-focus-visible:outline-zenit-green motion-reduce:transition-none"
                        >
                          <input
                            id={id}
                            type="checkbox"
                            name="product_interest"
                            value={product.erpCode}
                            className="size-4 shrink-0 accent-zenit-green focus-visible:outline-none"
                          />
                          {product.name}
                        </label>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>
      </fieldset>

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

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
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
        {showWhatsApp ? <WhatsAppLink href={whatsappUrl} /> : null}
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

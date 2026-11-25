import { AtSign, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";
import { publicEnv } from "@/lib/env";
import { cn } from "@/lib/utils";

/**
 * Captación de esta fase: CTA de WhatsApp con mensaje precargado.
 *
 * Aislado a propósito: en la fase de automatizaciones se sustituye este componente
 * por un formulario con webhook, sin tocar a quien lo usa (sección de contacto y fichas).
 *
 * - Con NEXT_PUBLIC_WHATSAPP_URL (https://wa.me/58…): abre el chat con `text` precargado.
 * - Sin ella: abre el chat de Instagram de @lefrevzla (Instagram no permite precargar texto).
 */

const INSTAGRAM_DM = `https://ig.me/m/${site.instagram.handle.replace(/^@/, "")}`;

export function leadHref(message: string): { href: string; channel: "whatsapp" | "instagram" } {
  const base = publicEnv.NEXT_PUBLIC_WHATSAPP_URL;
  if (!base) return { href: INSTAGRAM_DM, channel: "instagram" };
  // Espacios como %20 (no "+"), que es lo que documenta WhatsApp para wa.me/?text=.
  const url = new URL(base);
  url.searchParams.delete("text");
  const separator = url.search ? "&" : "?";
  return { href: `${url.toString()}${separator}text=${encodeURIComponent(message)}`, channel: "whatsapp" };
}

/** Mensaje precargado para una ficha de producto. */
export function productLeadMessage(product: { name: string; erpCode: string }): string {
  return site.leadForm.productMessage.replace("{producto}", product.name).replace("{codigo}", product.erpCode);
}

type LeadCtaProps = {
  /** Mensaje precargado. Por defecto, el genérico de distribución. */
  message?: string;
  /** Texto del botón. Por defecto, "Escríbenos por WhatsApp" (o Instagram). */
  label?: string;
  /** Sobre fondo oscuro o verde: botón blanco. */
  inverted?: boolean;
  className?: string;
};

export function LeadCta({ message = site.leadForm.message, label, inverted = false, className }: LeadCtaProps) {
  const { href, channel } = leadHref(message);
  const Icon = channel === "whatsapp" ? MessageCircle : AtSign;
  const text = label ?? (channel === "whatsapp" ? site.leadForm.whatsapp : site.leadForm.instagram);

  return (
    <Button
      asChild
      size="xl"
      className={cn(
        "group rounded-xl px-6",
        inverted && "bg-zenit-white text-zenit-black hover:bg-zenit-white/90",
        className,
      )}
    >
      <a href={href} target="_blank" rel="noopener" data-lead-channel={channel}>
        <Icon aria-hidden="true" />
        {text}
        <span className="sr-only">{site.header.newTab}</span>
      </a>
    </Button>
  );
}

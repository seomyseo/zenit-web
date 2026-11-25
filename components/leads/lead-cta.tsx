import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";
import { publicEnv } from "@/lib/env";
import { cn } from "@/lib/utils";

/**
 * Botón de WhatsApp con mensaje precargado (NEXT_PUBLIC_WHATSAPP_URL, https://wa.me/58…).
 * Aparece en la sección de contacto, en las fichas, en el footer y como alternativa
 * cuando el formulario no puede enviar. Aislado para cambiar el canal sin tocar a quien lo usa.
 */

/** Enlace wa.me con el texto precargado (espacios como %20, que es lo que documenta WhatsApp). */
export function whatsappHref(message: string): string {
  const url = new URL(publicEnv.NEXT_PUBLIC_WHATSAPP_URL);
  url.searchParams.delete("text");
  const separator = url.search ? "&" : "?";
  return `${url.toString()}${separator}text=${encodeURIComponent(message)}`;
}

/** Mensaje precargado para una ficha de producto. */
export function productLeadMessage(product: { name: string; erpCode: string }): string {
  return site.leadForm.productMessage.replace("{producto}", product.name).replace("{codigo}", product.erpCode);
}

type LeadCtaProps = {
  /** Mensaje precargado. Por defecto, el genérico de distribución. */
  message?: string;
  /** Texto del botón. Por defecto, "Escríbenos por WhatsApp". */
  label?: string;
  /** solid: verde. inverted: blanco (sobre verde o negro). outline: secundario sobre blanco. */
  variant?: "solid" | "inverted" | "outline";
  className?: string;
};

export function LeadCta({ message = site.leadForm.message, label, variant = "solid", className }: LeadCtaProps) {
  return (
    <Button
      asChild
      size="xl"
      variant={variant === "outline" ? "outline" : "default"}
      className={cn(
        "group rounded-xl px-6",
        variant === "inverted" && "bg-zenit-white text-zenit-black hover:bg-zenit-white/90",
        variant === "outline" &&
          "border-2 border-zenit-black bg-transparent text-zenit-black hover:bg-zenit-black hover:text-zenit-white",
        className,
      )}
    >
      <a href={whatsappHref(message)} target="_blank" rel="noopener" data-lead-channel="whatsapp">
        <MessageCircle aria-hidden="true" />
        {label ?? site.leadForm.whatsapp}
        <span className="sr-only">{site.header.newTab}</span>
      </a>
    </Button>
  );
}

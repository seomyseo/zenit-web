import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

/** Botón de WhatsApp. No se muestra si NEXT_PUBLIC_WHATSAPP_URL no está configurada. */
export function WhatsAppLink({ href, className }: { href?: string; className?: string }) {
  if (!href) return null;
  return (
    <Button
      asChild
      size="xl"
      variant="outline"
      className={cn(
        "border-2 border-zenit-black bg-transparent text-zenit-black hover:bg-zenit-black hover:text-zenit-white",
        className,
      )}
    >
      <a href={href} target="_blank" rel="noopener">
        <MessageCircle aria-hidden="true" />
        {site.leadForm.whatsapp}
        <span className="sr-only">{site.header.newTab}</span>
      </a>
    </Button>
  );
}

import { WingMotif } from "@/components/brand/wing-motif";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
  as?: "h1" | "h2";
  /** Sobre fondo negro: texto blanco y motivo gris. */
  inverted?: boolean;
  className?: string;
};

/** Antetítulo con el motivo del ala, título en Roboto Slab y bajada opcional. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  as: Heading = "h2",
  inverted = false,
  className,
}: SectionHeadingProps) {
  return (
    <header className={cn("max-w-2xl", className)}>
      <p
        className={cn(
          "flex items-center gap-3 text-sm font-semibold tracking-wide uppercase",
          inverted ? "text-zenit-white" : "text-zenit-green",
        )}
      >
        <WingMotif height={12} tone={inverted ? "gris" : "verde"} />
        {eyebrow}
      </p>
      <Heading
        id={id}
        className={cn(
          "mt-3 font-display text-3xl leading-tight sm:text-4xl",
          inverted ? "text-zenit-white" : "text-zenit-black",
        )}
      >
        {title}
      </Heading>
      {lead ? (
        <p
          className={cn(
            "mt-3 text-base leading-relaxed",
            inverted ? "text-zenit-white/85" : "text-zenit-gray",
          )}
        >
          {lead}
        </p>
      ) : null}
    </header>
  );
}

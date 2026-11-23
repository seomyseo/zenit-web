import Image from "next/image";
import { cn } from "@/lib/utils";

/** Proporción del logo oficial recortado (viewBox 135.809 × 75.668). */
const RATIO = 135.809 / 75.668;
/** Altura de la "Z" respecto de la altura total del logo: espacio libre mínimo (CLAUDE.md). */
export const LOGO_CLEAR_SPACE = 20.67 / 75.668;

type ZenitLogoProps = {
  /** Versión oficial: color sobre blanco, negro, blanco sobre negro o verde, gris discreto. */
  variant?: "color" | "negro" | "blanco" | "gris";
  /** Altura del logo en px (sin el espacio libre). */
  height: number;
  /** Agrega alrededor el espacio libre de la altura de la "Z". */
  withClearSpace?: boolean;
  priority?: boolean;
  className?: string;
};

export function ZenitLogo({
  variant = "color",
  height,
  withClearSpace = false,
  priority = false,
  className,
}: ZenitLogoProps) {
  const width = Math.round(height * RATIO);
  return (
    <span
      className={cn("inline-block shrink-0 leading-none", className)}
      style={withClearSpace ? { padding: Math.ceil(height * LOGO_CLEAR_SPACE) } : undefined}
    >
      <Image
        src={`/brand/zenit-${variant}.svg`}
        alt="Zenit"
        width={width}
        height={height}
        priority={priority}
        unoptimized
        className="block h-auto w-auto"
        style={{ height, width }}
      />
    </span>
  );
}

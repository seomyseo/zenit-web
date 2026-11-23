import { cn } from "@/lib/utils";

/** Proporción de las dos franjas del ala (recorte del vector oficial). */
const RATIO = 63.23 / 25.336;

/**
 * Motivo gráfico: las franjas del ala izquierda del águila, tomadas del SVG oficial
 * (sin redibujar). Solo decorativo.
 */
export function WingMotif({
  tone = "verde",
  height = 12,
  className,
}: {
  tone?: "verde" | "gris";
  height?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG decorativo diminuto, sin optimización posible
    <img
      src={`/brand/zenit-alas-${tone}.svg`}
      alt=""
      aria-hidden="true"
      width={Math.round(height * RATIO)}
      height={height}
      className={cn("inline-block shrink-0", className)}
      style={{ height, width: "auto" }}
    />
  );
}

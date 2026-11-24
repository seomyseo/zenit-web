"use client";

/**
 * Globo de alambre, adaptado de "contact-with-globe" (21st.dev) a las reglas del proyecto:
 * - Mapa local (public/geo/countries-110m.json, de world-atlas@2, licencia ISC), sin CDN.
 * - Solo d3-geo (no todo d3); los trazos los dibuja React.
 * - Colores de marca: país destacado en verde, el resto en gris; sin modo oscuro.
 * - Se carga al acercarse a la pantalla y gira hasta el país destacado una sola vez.
 *   Con prefers-reduced-motion aparece ya centrado, sin animación.
 */

import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { cn } from "@/lib/utils";

type CountryFeature = Feature<Geometry, { name: string }>;

type GlobeWireframeProps = {
  /** id numérico ISO del país destacado (Venezuela: "862"). */
  highlightId?: string;
  /** [longitud, latitud] hacia donde gira el globo. */
  focus?: [number, number];
  /** Grados de giro inicial antes de llegar al foco. */
  spinFrom?: number;
  durationMs?: number;
  className?: string;
};

const SIZE = 400;
let worldCache: Promise<CountryFeature[]> | null = null;

function loadWorld(): Promise<CountryFeature[]> {
  worldCache ??= fetch("/geo/countries-110m.json")
    .then((response) => response.json() as Promise<Topology<{ countries: GeometryCollection<{ name: string }> }>>)
    .then((world) => (feature(world, world.objects.countries) as FeatureCollection<Geometry, { name: string }>).features)
    .catch(() => {
      worldCache = null;
      return [];
    });
  return worldCache;
}

export function GlobeWireframe({
  highlightId = "862",
  focus = [-66.6, 7.5],
  spinFrom = 70,
  durationMs = 1800,
  className,
}: GlobeWireframeProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [visible, setVisible] = useState(false);
  const [offset, setOffset] = useState(spinFrom);

  // Carga diferida: el mapa solo se pide cuando el globo está cerca de la pantalla.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    loadWorld().then((data) => {
      if (!cancelled) setCountries(data);
    });
    return () => {
      cancelled = true;
    };
  }, [visible]);

  // Giro único hasta el foco (ease-out). Con movimiento reducido no se anima.
  useEffect(() => {
    if (countries.length === 0 || reduce) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setOffset(spinFrom * (1 - eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [countries.length, reduce, spinFrom, durationMs]);

  const currentOffset = reduce ? 0 : offset;

  const paths = useMemo(() => {
    const projection = geoOrthographic()
      .scale(SIZE / 2 - 4)
      .translate([SIZE / 2, SIZE / 2])
      .rotate([-(focus[0] - currentOffset), -focus[1] + 10])
      .precision(0.3);
    const path = geoPath(projection);
    return {
      sphere: path({ type: "Sphere" }) ?? "",
      graticule: path(geoGraticule10()) ?? "",
      // Algunos territorios del mapa no tienen id (p. ej. Kosovo): la clave usa también el índice.
      countries: countries.map((country, index) => ({
        id: String(country.id ?? ""),
        key: `${country.id ?? "x"}-${index}`,
        d: path(country) ?? "",
      })),
    };
  }, [countries, focus, currentOffset]);

  return (
    <div ref={ref} className={cn("relative aspect-square w-full", className)}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full" aria-hidden="true">
        <path d={paths.sphere} fill="var(--color-zenit-white)" stroke="var(--color-zenit-gray-200)" strokeWidth={1.5} />
        <path d={paths.graticule} fill="none" stroke="var(--color-zenit-gray)" strokeOpacity={0.12} strokeWidth={0.6} />
        {paths.countries.map((country) =>
          country.id === highlightId ? null : (
            <path
              key={country.key}
              d={country.d}
              fill="var(--color-zenit-gray-50)"
              stroke="var(--color-zenit-gray)"
              strokeOpacity={0.45}
              strokeWidth={0.6}
            />
          ),
        )}
        {/* País destacado al final, para que quede por encima */}
        {paths.countries
          .filter((country) => country.id === highlightId)
          .map((country) => (
            <path key={country.key} d={country.d} fill="var(--color-zenit-green)" stroke="var(--color-zenit-green)" strokeWidth={1} />
          ))}
      </svg>
    </div>
  );
}

"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { WingMotif } from "@/components/brand/wing-motif";
import { Button } from "@/components/ui/button";

type Kit = { slug: string; model?: string; name: string };

type Props = {
  eyebrow: string;
  title: string;
  lead: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  kitsLabel: string;
  kits: Kit[];
  image: { src: string; alt: string };
};

/** Centro del sol en la escena (viewBox 600 × 500): en el cielo, sobre el panel desvanecido. */
const SUN = { x: 140, y: 105, r: 40 };
/** Del sol a la salida de la bomba (medida sobre la foto del kit ZBC-002S). */
const WATER_PATH = `M ${SUN.x + 34} ${SUN.y + 30} C 300 70, 470 120, 505 236`;
const RAYS = Array.from({ length: 12 }, (_, i) => (i * Math.PI * 2) / 12);
/** Redondeo para que servidor y navegador generen el mismo atributo (evita error de hidratación). */
const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * "El sol mueve el agua": cielo y campo con tonos derivados del verde y el gris
 * (sin colores nuevos), un sol que sube con el scroll y rayos verdes que se vuelven
 * una línea de agua hacia la bomba. El panel de la foto queda apenas insinuado.
 */
export function SolarBanner({ eyebrow, title, lead, primaryCta, secondaryCta, kitsLabel, kits, image }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const sunY = useTransform(scrollYProgress, [0.05, 0.4], reduce ? [0, 0] : [150, 0]);
  const raysScale = useTransform(scrollYProgress, [0.15, 0.38], reduce ? [1, 1] : [0.6, 1]);
  const raysOpacity = useTransform(scrollYProgress, [0.15, 0.32], reduce ? [1, 1] : [0, 1]);
  const water = useTransform(scrollYProgress, [0.28, 0.48], reduce ? [1, 1] : [0, 1]);
  // El punteado que fluye aparece cuando la línea terminó de dibujarse (pathLength usa su propio dasharray).
  const flow = useTransform(water, [0.9, 1], [0, 1]);

  return (
    <section
      ref={ref}
      id="solar"
      aria-labelledby="solar-title"
      className="relative isolate overflow-hidden bg-[linear-gradient(180deg,color-mix(in_oklab,#02682e_10%,#ffffff)_0%,#ffffff_70%)]"
    >
      {/* Campo a todo el ancho: dos lomas en tonos del verde (detrás de la foto) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 -z-10 h-28 w-full sm:h-36 lg:h-44"
      >
        <path
          d="M0 90 C 260 30, 520 70, 760 80 S 1220 30, 1440 60 L 1440 200 L 0 200 Z"
          fill="color-mix(in oklab, #02682e 28%, #ffffff)"
        />
        <path d="M0 150 C 300 105, 620 140, 900 128 S 1300 105, 1440 118 L 1440 200 L 0 200 Z" fill="#02682e" />
      </svg>

      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pt-16 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:gap-6 lg:pt-20">
        <div className="relative z-10 pb-4 lg:pb-44">
          <p className="flex items-center gap-3 text-sm font-semibold tracking-wide text-zenit-green uppercase">
            <WingMotif height={12} />
            {eyebrow}
          </p>
          <h2 id="solar-title" className="mt-4 font-display text-4xl leading-[1.05] text-zenit-black sm:text-5xl lg:text-6xl">
            {title}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zenit-gray sm:text-lg">{lead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="xl">
              <Link href={primaryCta.href}>{primaryCta.label}</Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="border-2 border-zenit-black bg-transparent text-zenit-black hover:bg-zenit-black hover:text-zenit-white"
            >
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          </div>
          <div className="mt-8">
            <p className="text-xs font-semibold tracking-wide text-zenit-gray uppercase">{kitsLabel}</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {kits.map((kit) => (
                <li key={kit.slug}>
                  <Link
                    href={`/productos/${kit.slug}`}
                    className="inline-flex min-h-10 items-center rounded-sm border border-zenit-gray-200 bg-zenit-white px-3 text-sm font-semibold text-zenit-black hover:border-zenit-green hover:text-zenit-green"
                  >
                    {kit.model ?? kit.name}
                    <span className="sr-only">: {kit.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Escena: sol, rayos, línea de agua, campo y la bomba */}
        <div className="relative -mx-4 aspect-[6/5] sm:mx-0" aria-hidden="true">
          {/* Capa 2: kit solar; el panel queda apenas insinuado con una máscara degradada */}
          <div className="absolute right-[2%] bottom-[6%] aspect-square w-[78%]">
            <Image
              src={image.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 30rem, 80vw"
              className="object-contain [mask-image:linear-gradient(90deg,transparent_0%,rgb(0_0_0/0.12)_40%,#000_62%)] drop-shadow-[0_18px_18px_rgb(0_0_0/0.35)]"
            />
          </div>

          {/* Capa 3: sol que sube y rayo que se vuelve agua hacia la bomba */}
          <svg viewBox="0 0 600 500" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
            <motion.g style={{ y: sunY }}>
              <motion.g
                style={{ scale: raysScale, opacity: raysOpacity, originX: `${SUN.x}px`, originY: `${SUN.y}px` }}
              >
                {RAYS.map((angle) => (
                  <line
                    key={angle}
                    x1={r2(SUN.x + Math.cos(angle) * (SUN.r + 12))}
                    y1={r2(SUN.y + Math.sin(angle) * (SUN.r + 12))}
                    x2={r2(SUN.x + Math.cos(angle) * (SUN.r + 34))}
                    y2={r2(SUN.y + Math.sin(angle) * (SUN.r + 34))}
                    stroke="#02682e"
                    strokeWidth={6}
                    strokeLinecap="round"
                  />
                ))}
              </motion.g>
              <circle cx={SUN.x} cy={SUN.y} r={SUN.r} fill="#ffffff" stroke="#02682e" strokeWidth={8} />
            </motion.g>
            <motion.path
              d={WATER_PATH}
              fill="none"
              stroke="#02682e"
              strokeWidth={7}
              strokeLinecap="round"
              style={{ pathLength: water }}
            />
            <motion.path
              d={WATER_PATH}
              fill="none"
              stroke="#ffffff"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray="2 14"
              className="animate-[zenit-water_1.2s_linear_infinite] motion-reduce:animate-none"
              style={{ opacity: flow }}
            />
          </svg>
        </div>
      </div>
      <p className="sr-only">{image.alt}</p>
    </section>
  );
}

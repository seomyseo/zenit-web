"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { WingMotif } from "@/components/brand/wing-motif";
import { Button } from "@/components/ui/button";
import type { HeroSlide } from "@/lib/lab/hero-data";

type Props = {
  eyebrow: string;
  title: string;
  lead: string;
  tagline: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  products: HeroSlide[];
  codes: string[];
};

const EASE = [0.22, 1, 0.36, 1] as const;
/** Alturas relativas en la vitrina: el del centro, más alto ("altura"). */
const SCALE = [0.78, 0.88, 1, 0.88, 0.78];

/**
 * Variante C, "Vitrina": escenario negro, la línea completa sobre un piso verde.
 * Los productos suben uno tras otro y abajo corre una cinta con los modelos.
 */
export function HeroVitrina({ eyebrow, title, lead, tagline, primaryCta, secondaryCta, products, codes }: Props) {
  const reduce = useReducedMotion();
  const ribbon = [...codes, tagline.toUpperCase()];

  return (
    <section aria-labelledby="vitrina-title" className="relative isolate overflow-hidden bg-zenit-black text-zenit-white">
      {/* Resplandor de escenario: gris derivado, sin colores nuevos */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[70%] bg-[radial-gradient(ellipse_at_50%_0%,rgb(255_255_255/0.10),transparent_65%)]"
      />

      <div className="mx-auto flex min-h-[calc(100svh-6rem)] max-w-7xl flex-col px-4 pt-12 sm:px-6 lg:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 text-sm font-semibold tracking-wide uppercase"
          >
            <WingMotif height={12} />
            {eyebrow}
            <WingMotif height={12} className="-scale-x-100" />
          </motion.p>
          <motion.h1
            id="vitrina-title"
            initial={{ opacity: 0, y: reduce ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="mt-4 font-display text-[2.3rem] leading-[1.04] sm:text-6xl"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zenit-white/80 sm:text-lg"
          >
            {lead}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="xl">
              <Link href={primaryCta.href}>{primaryCta.label}</Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="border-2 border-zenit-white bg-transparent text-zenit-white hover:bg-zenit-white hover:text-zenit-black"
            >
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          </motion.div>
        </div>

        {/* Vitrina: los productos suben en secuencia hasta el piso */}
        <ul className="relative mt-auto grid grid-cols-3 items-end gap-2 pt-10 sm:grid-cols-5 sm:gap-4">
          {products.map((product, i) => (
            <motion.li
              key={product.erpCode}
              className={`group relative ${i === 0 || i === products.length - 1 ? "hidden sm:block" : ""}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 140 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5 + Math.abs(i - 2) * 0.15, ease: EASE }}
            >
              <Link href={`/productos/${product.slug}`} className="block">
                <span className="relative mx-auto block aspect-square" style={{ width: `${SCALE[i]! * 100}%` }}>
                  <Image
                    src={product.image.src}
                    alt={product.image.alt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 16rem, 20vw"
                    className="object-contain object-bottom drop-shadow-[0_20px_25px_rgb(0_0_0/0.7)] transition-transform duration-300 group-hover:-translate-y-3 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
                  />
                </span>
                <span className="pointer-events-none absolute inset-x-0 -top-2 hidden -translate-y-full text-center text-xs font-semibold text-zenit-white opacity-0 transition-opacity group-hover:opacity-100 group-has-focus-visible:opacity-100 sm:block">
                  {product.name}
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
        {/* Piso verde con reflejo */}
        <motion.div
          aria-hidden="true"
          className="h-1.5 origin-center bg-zenit-green"
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
        />
        <div aria-hidden="true" className="h-10 bg-gradient-to-b from-zenit-white/[0.06] to-transparent" />
      </div>

      {/* Cinta con los modelos */}
      <div aria-hidden="true" className="border-t border-zenit-white/10 bg-zenit-green py-3">
        <div className="flex w-max animate-[zenit-marquee_40s_linear_infinite] gap-10 motion-reduce:animate-none">
          {[...ribbon, ...ribbon].map((code, i) => (
            <span key={`${code}-${i}`} className="tagline text-lg whitespace-nowrap text-zenit-white">
              {code}
            </span>
          ))}
        </div>
      </div>
      <p className="sr-only">{tagline}</p>
    </section>
  );
}

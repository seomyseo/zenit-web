"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { WingMotif } from "@/components/brand/wing-motif";
import { Button } from "@/components/ui/button";
import type { HeroSlide } from "@/lib/lab/hero-data";
import { CountUp } from "./count-up";

type Props = {
  eyebrow: string;
  title: string;
  lead: string;
  tagline: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  product: HeroSlide;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Variante B, "Diagonal": fondo blanco, panel verde con corte inclinado (ángulo de
 * las alas) que entra desde la derecha, la bomba sola sobre el corte y franjas que barren.
 */
export function HeroDiagonal({ eyebrow, title, lead, tagline, primaryCta, secondaryCta, product }: Props) {
  const reduce = useReducedMotion();
  const enter = (delay: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } }
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: EASE },
        };

  return (
    <section aria-labelledby="diagonal-title" className="relative isolate overflow-hidden bg-zenit-white">
      {/* Panel verde con corte diagonal */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 -z-10 hidden w-[56%] bg-zenit-green lg:block"
        style={{ clipPath: "polygon(34% 0, 100% 0, 100% 100%, 0 100%)" }}
        initial={reduce ? false : { x: "100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
      />

      {/* Franjas del ala que barren en diagonal */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute -z-10 hidden lg:block"
          style={{ right: `${6 + i * 9}%`, top: `${10 + i * 22}%` }}
          initial={reduce ? false : { opacity: 0, x: 120, y: -60 }}
          animate={{ opacity: 0.22, x: 0, y: 0 }}
          transition={{ duration: 1, delay: 0.5 + i * 0.12, ease: EASE }}
        >
          <WingMotif tone="gris" height={90 - i * 20} className="brightness-0 invert" />
        </motion.div>
      ))}

      <div className="mx-auto grid min-h-[calc(100svh-6rem)] max-w-7xl items-center gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:py-16">
        <div className="relative">
          <motion.p
            {...enter(0.1)}
            className="flex items-center gap-3 text-sm font-semibold tracking-wide text-zenit-green uppercase"
          >
            <WingMotif height={12} />
            {eyebrow}
          </motion.p>
          <motion.h1
            id="diagonal-title"
            {...enter(0.2)}
            className="mt-4 font-display text-[2.3rem] leading-[1.04] text-zenit-black sm:text-6xl lg:text-[4rem]"
          >
            {title}
          </motion.h1>
          <motion.p {...enter(0.3)} className="tagline mt-5 text-2xl text-zenit-green sm:text-3xl">
            {tagline}
          </motion.p>
          <motion.p {...enter(0.35)} className="mt-5 max-w-lg text-base leading-relaxed text-zenit-gray sm:text-lg">
            {lead}
          </motion.p>
          <motion.div {...enter(0.45)} className="mt-8 flex flex-col gap-3 sm:flex-row">
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
          </motion.div>
        </div>

        <div className="relative py-8 lg:py-0">
          {/* En móvil el verde va solo detrás del producto, con el mismo corte diagonal. */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 -inset-x-4 -z-10 bg-zenit-green sm:-inset-x-6 lg:hidden"
            style={{ clipPath: "polygon(0 22%, 100% 0, 100% 100%, 0 100%)" }}
          />
          <motion.div
            className="relative mx-auto aspect-square w-full max-w-[24rem] sm:max-w-[30rem] lg:max-w-[36rem]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 80, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
          >
            {/* Sombra de piso */}
            <div
              aria-hidden="true"
              className="absolute inset-x-[14%] bottom-[6%] h-[7%] rounded-[50%] bg-zenit-black/35 blur-xl"
            />
            <Image
              src={product.image.src}
              alt={product.image.alt}
              fill
              priority
              sizes="(min-width: 1024px) 36rem, 90vw"
              className="object-contain"
            />
          </motion.div>

          <motion.div
            {...enter(0.7)}
            className="relative mx-auto -mt-2 max-w-[30rem] rounded-sm bg-zenit-black px-5 py-4 text-zenit-white shadow-[0_20px_40px_-20px_rgb(0_0_0/0.6)]"
          >
            <p className="text-xs font-semibold tracking-wide text-zenit-white/70 uppercase">
              {product.model ? `${product.model} · ` : ""}
              {product.kicker}
            </p>
            <ul className="mt-3 grid grid-cols-3 gap-3">
              {product.figures.map((figure) => (
                <li key={figure.label} className="border-l-2 border-zenit-green pl-3">
                  <CountUp value={figure.value} className="block font-display text-lg whitespace-nowrap sm:text-2xl" />
                  <span className="mt-0.5 block text-[0.7rem] text-zenit-white/70">{figure.label}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

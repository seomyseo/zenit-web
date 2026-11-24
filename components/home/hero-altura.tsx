"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { WingMotif } from "@/components/brand/wing-motif";
import { Button } from "@/components/ui/button";
import type { HeroSlide } from "@/lib/hero-data";
import { CountUp } from "@/components/motion/count-up";

const SLIDE_MS = 6000;

type Props = {
  /** id de la sección ("inicio" en la home, destino del menú). */
  id?: string;
  eyebrow: string;
  title: string;
  lead: string;
  tagline: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  slides: HeroSlide[];
};

/**
 * Variante A, "Altura": escenario negro a pantalla completa, lema gigante de fondo,
 * tres productos que rotan con un corte diagonal verde y cifras que suben.
 */
export function HeroAltura({ id, eyebrow, title, lead, tagline, primaryCta, secondaryCta, slides }: Props) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const productY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const taglineY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);

  useEffect(() => {
    if (paused || reduce) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(id);
  }, [index, paused, reduce, slides.length]);

  const slide = slides[index]!;

  return (
    <section
      ref={sectionRef}
      id={id}
      aria-labelledby="altura-title"
      aria-roledescription="carrusel"
      className="relative isolate overflow-hidden bg-zenit-black text-zenit-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Lema gigante de fondo */}
      <motion.p
        aria-hidden="true"
        style={{ y: taglineY }}
        className="tagline pointer-events-none absolute -bottom-[0.12em] left-0 -z-10 text-[17vw] leading-[0.85] whitespace-nowrap text-zenit-white/[0.05] select-none"
      >
        {tagline}
      </motion.p>

      <div className="mx-auto grid min-h-[calc(100svh-6rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:py-16">
        <div>
          <motion.p
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 text-sm font-semibold tracking-wide text-zenit-white uppercase"
          >
            <WingMotif height={12} />
            {eyebrow}
          </motion.p>
          {/* Sin animación de entrada: es el elemento más grande (LCP) y debe pintarse de inmediato. */}
          <h1
            id="altura-title"
            className="mt-5 font-display text-[2.4rem] leading-[1.02] sm:text-6xl lg:text-[4.4rem]"
          >
            {title}
          </h1>
          <p className="tagline mt-5 text-xl text-zenit-white sm:text-2xl">{tagline}</p>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-zenit-white/80 sm:text-lg"
          >
            {lead}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
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

          {/* Selector de producto con barra de avance */}
          <div className="mt-10 grid grid-cols-3 gap-3" role="tablist" aria-label="Productos destacados">
            {slides.map((s, i) => (
              <button
                key={s.erpCode}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-controls="altura-panel"
                onClick={() => setIndex(i)}
                className="group text-left"
              >
                <span className="relative block h-1 overflow-hidden bg-zenit-white/15">
                  {i === index ? (
                    <motion.span
                      key={`${index}-${paused}`}
                      className="absolute inset-y-0 left-0 bg-zenit-green"
                      initial={{ width: reduce ? "100%" : "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: paused || reduce ? 0 : SLIDE_MS / 1000, ease: "linear" }}
                    />
                  ) : null}
                </span>
                <span
                  className={`mt-2 block text-xs font-semibold tracking-wide uppercase transition-colors ${
                    i === index ? "text-zenit-white" : "text-zenit-white/55 group-hover:text-zenit-white"
                  }`}
                >
                  <span className="font-display">0{i + 1}</span> {s.kicker}
                </span>
              </button>
            ))}
          </div>
        </div>

        <motion.div style={{ y: productY }} className="relative" id="altura-panel" role="tabpanel" aria-live="polite">
          {/* Banda diagonal verde con el ángulo de las alas */}
          <div
            aria-hidden="true"
            className="absolute inset-x-[-20%] top-[18%] -z-10 h-[46%] -skew-y-[24deg] bg-zenit-green"
          />
          <div className="relative mx-auto aspect-square w-full max-w-[26rem] sm:max-w-[32rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slide.erpCode}
                className="absolute inset-0"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 60, clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }}
                animate={{ opacity: 1, y: 0, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -40 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={slide.image.src}
                  alt={slide.image.alt}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 32rem, 90vw"
                  className="object-contain drop-shadow-[0_30px_40px_rgb(0_0_0/0.6)]"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.erpCode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="mt-6"
            >
              <p className="text-sm text-zenit-white/70">
                {slide.model ? <span className="font-semibold text-zenit-white">{slide.model} · </span> : null}
                <Link href={`/productos/${slide.slug}`} className="underline-offset-4 hover:underline">
                  {slide.name}
                </Link>
              </p>
              <ul className="mt-4 grid grid-cols-3 gap-3 border-t border-zenit-white/15 pt-4">
                {slide.figures.map((figure) => (
                  <li key={figure.label}>
                    <CountUp value={figure.value} className="block font-display text-xl whitespace-nowrap sm:text-4xl" />
                    <span className="mt-1 block text-xs text-zenit-white/70">{figure.label}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

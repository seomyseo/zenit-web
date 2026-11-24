"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { CardGroup, CardProduct } from "@/lib/card-data";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Propuesta B, "Escaparate": fondo negro, tarjetas oscuras con un foco de luz que
 * sigue al cursor y una leve inclinación 3D. El producto flota sobre el foco; las
 * cifras van en blanco con separadores verdes. Entrada con escala desde abajo.
 */
export function CardsEscaparate({ groups }: { groups: CardGroup[] }) {
  return (
    <div className="space-y-12">
      {groups.map(({ group, label, products }) => (
        <div key={group}>
          <h3 className="flex items-baseline gap-3 border-b border-zenit-white/20 pb-3 text-xl font-bold text-zenit-white sm:text-2xl">
            {label}
            <span className="text-base font-semibold text-zenit-white/60">({products.length})</span>
          </h3>
          <ul className="mt-6 grid gap-4 [perspective:1200px] sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {products.map((product, index) => (
              <EscaparateCard key={product.erpCode} product={product} index={index} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function EscaparateCard({ product, index }: { product: CardProduct; index: number }) {
  const reduce = useReducedMotion();
  // Posición del cursor dentro de la tarjeta (0 a 1).
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], reduce ? [0, 0] : [6, -6]), { stiffness: 180, damping: 18 });
  const rotateY = useSpring(useTransform(px, [0, 1], reduce ? [0, 0] : [-8, 8]), { stiffness: 180, damping: 18 });
  const spotX = useTransform(px, (v) => `${v * 100}%`);
  const spotY = useTransform(py, (v) => `${v * 100}%`);
  const spotlight = useTransform(
    [spotX, spotY],
    ([x, y]) => `radial-gradient(320px circle at ${x} ${y}, rgb(255 255 255 / 0.12), transparent 65%)`,
  );

  return (
    <motion.li
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.1, ease: EASE }}
    >
      <motion.article
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          px.set((event.clientX - rect.left) / rect.width);
          py.set((event.clientY - rect.top) / rect.height);
        }}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
        }}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zenit-white/10 bg-zenit-white/[0.04] transition-colors duration-300 hover:border-zenit-white/25 has-focus-visible:border-zenit-white"
      >
        {/* Foco de luz que sigue al cursor (blanco suave, sin colores nuevos) */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: spotlight }}
        />

        <div className="relative flex items-center gap-2 px-5 pt-5">
          <span className="rounded-full bg-zenit-white/10 px-2.5 py-0.5 text-xs font-semibold text-zenit-white">
            {product.kind}
          </span>
          {product.variant ? (
            <span className="rounded-full border border-zenit-white/30 px-2.5 py-0.5 text-xs font-semibold text-zenit-white">
              {product.variant}
            </span>
          ) : null}
        </div>

        <div className="relative mx-auto mt-2 aspect-square w-[82%]" style={{ transform: "translateZ(40px)" }}>
          <div
            aria-hidden="true"
            className="absolute inset-[14%] rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.16),transparent_70%)]"
          />
          <Image
            src={product.image.src}
            alt={product.image.alt}
            fill
            sizes="(min-width: 1024px) 20rem, (min-width: 640px) 40vw, 80vw"
            className="object-contain p-[8%] drop-shadow-[0_24px_24px_rgb(0_0_0/0.7)] transition-transform duration-500 group-hover:-translate-y-2 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
          />
        </div>

        <div className="relative flex flex-1 flex-col px-5 pb-5">
          {product.model ? (
            <p className="font-display text-2xl leading-tight text-zenit-white">{product.model}</p>
          ) : null}
          <h4 className="mt-1 text-sm leading-snug font-semibold text-zenit-white/85">
            <Link
              href={`/productos/${product.slug}`}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {product.name}
            </Link>
          </h4>
          {product.facts.length > 0 ? (
            <dl className="mt-4 grid grid-cols-3 divide-x divide-zenit-green border-t border-zenit-white/10 pt-4">
              {product.facts.map((fact) => (
                <div key={fact.label} className="px-2 first:pl-0">
                  <dt className="text-[0.7rem] text-zenit-white/70">{fact.label}</dt>
                  <dd className="font-display text-base leading-tight text-zenit-white sm:text-lg">{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <span
            aria-hidden="true"
            className="absolute top-0 right-5 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-zenit-green text-zenit-white transition-transform duration-300 group-hover:rotate-45 motion-reduce:transition-none"
          >
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </motion.article>
    </motion.li>
  );
}

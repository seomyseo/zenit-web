"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion, useScroll } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { CardGroup, CardProduct } from "@/lib/card-data";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Propuesta C, "Riel": cada grupo es un riel horizontal que se desliza con el dedo
 * (scroll-snap), con flechas y barra de avance en escritorio. Fotos grandes; al pasar
 * el mouse entra una banda verde diagonal (ángulo de las alas) detrás del producto.
 * Las tarjetas entran deslizándose desde la derecha.
 */
export function CardsRiel({ groups }: { groups: CardGroup[] }) {
  return (
    <div className="space-y-14">
      {groups.map((group) => (
        <Rail key={group.group} group={group} />
      ))}
    </div>
  );
}

function Rail({ group }: { group: CardGroup }) {
  const reduce = useReducedMotion();
  const railRef = useRef<HTMLUListElement>(null);
  const { scrollXProgress } = useScroll({ container: railRef });
  const titleId = `riel-${group.group}`;

  const step = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector("li");
    const amount = card ? card.getBoundingClientRect().width + 20 : rail.clientWidth * 0.8;
    rail.scrollBy({ left: direction * amount, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section aria-labelledby={titleId}>
      <div className="flex items-end justify-between gap-4">
        <h3 id={titleId} className="flex items-baseline gap-3 text-xl font-bold text-zenit-black sm:text-2xl">
          {group.label}
          <span className="text-base font-semibold text-zenit-gray">({group.products.length})</span>
        </h3>
        {/* Flechas solo si el riel tiene más tarjetas de las que caben (más de 3). */}
        <div className={group.products.length > 3 ? "hidden gap-2 sm:flex" : "hidden"}>
          <button
            type="button"
            onClick={() => step(-1)}
            className="flex size-11 items-center justify-center rounded-full border border-zenit-gray-200 bg-zenit-white text-zenit-black transition-colors hover:border-zenit-green hover:text-zenit-green"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
            <span className="sr-only">Anteriores de {group.label}</span>
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            className="flex size-11 items-center justify-center rounded-full bg-zenit-black text-zenit-white transition-colors hover:bg-zenit-green"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
            <span className="sr-only">Siguientes de {group.label}</span>
          </button>
        </div>
      </div>

      {/* Barra de avance del riel */}
      <div aria-hidden="true" className="mt-3 h-0.5 bg-zenit-gray-200">
        <motion.div className="h-full origin-left bg-zenit-green" style={{ scaleX: scrollXProgress }} />
      </div>

      <motion.ul
        ref={railRef}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        className="-mx-4 mt-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] sm:mx-0 sm:px-0 motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
      >
        {group.products.map((product) => (
          <motion.li
            key={product.erpCode}
            className="w-[78%] shrink-0 snap-start sm:w-[22rem]"
            variants={{
              hidden: reduce ? { opacity: 0 } : { opacity: 0, x: 80 },
              show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
            }}
          >
            <RielCard product={product} />
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}

function RielCard({ product }: { product: CardProduct }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-zenit-white shadow-[0_1px_0_0_var(--color-zenit-gray-200),0_0_0_1px_var(--color-zenit-gray-200)] transition-shadow duration-300 hover:shadow-[0_24px_48px_-28px_rgb(0_0_0/0.5),0_0_0_1px_var(--color-zenit-green)] has-focus-visible:shadow-[0_0_0_3px_var(--color-zenit-green)]">
      <div className="relative aspect-square overflow-hidden bg-zenit-gray-50">
        {/* Banda diagonal verde que entra al pasar el mouse */}
        <div
          aria-hidden="true"
          className="absolute inset-x-[-30%] top-[30%] h-[34%] -translate-x-full -skew-y-[24deg] bg-zenit-green transition-transform duration-500 ease-out group-hover:translate-x-0 motion-reduce:transition-none"
        />
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes="(min-width: 640px) 22rem, 78vw"
          className="object-contain p-[10%] drop-shadow-[0_18px_18px_rgb(0_0_0/0.25)] transition-transform duration-500 group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-zenit-black px-3 py-1 text-xs font-semibold text-zenit-white">
            {product.model ?? product.kind}
          </span>
          {product.variant ? (
            <span className="rounded-full bg-zenit-white px-3 py-1 text-xs font-semibold text-zenit-black shadow-sm">
              {product.variant}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h4 className="text-base leading-snug font-bold text-zenit-black">
          <Link
            href={`/productos/${product.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {product.name}
          </Link>
        </h4>
        {product.facts.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {product.facts.map((fact) => (
              <li key={fact.label} className="rounded-md bg-zenit-gray-50 px-2 py-1 text-xs text-zenit-gray">
                {fact.label} <strong className="font-semibold text-zenit-black">{fact.value}</strong>
              </li>
            ))}
          </ul>
        ) : null}
        <span
          aria-hidden="true"
          className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-zenit-green"
        >
          Ver ficha
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
        </span>
      </div>
    </article>
  );
}

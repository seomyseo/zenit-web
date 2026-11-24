"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { CardGroup, CardProduct } from "@/lib/card-data";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Propuesta A, "Ficha técnica": tarjeta clara con cuadrícula de plano detrás del
 * producto, modelo grande, etiqueta de variante y 3 cifras clave. Al pasar el mouse
 * el producto "sube" (altura) y una barra verde recorre la base. Entrada escalonada.
 */
export function CardsFicha({ groups }: { groups: CardGroup[] }) {
  return (
    <div className="space-y-12">
      {groups.map(({ group, label, products }) => (
        <div key={group}>
          <h3 className="flex items-baseline gap-3 border-b-2 border-zenit-black pb-3 text-xl font-bold text-zenit-black sm:text-2xl">
            {label}
            <span className="text-base font-semibold text-zenit-gray">({products.length})</span>
          </h3>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {products.map((product, index) => (
              <FichaCard key={product.erpCode} product={product} index={index} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function FichaCard({ product, index }: { product: CardProduct; index: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.li
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: EASE }}
    >
      <article className="group relative flex h-full flex-col overflow-hidden rounded-sm border border-zenit-gray-200 bg-zenit-white transition-[border-color,box-shadow] duration-300 hover:border-zenit-green hover:shadow-[0_18px_40px_-24px_rgb(0_0_0/0.45)] has-focus-visible:border-zenit-green">
        {/* Cabecera: modelo grande y variante */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div>
            <p className="text-[0.7rem] font-semibold tracking-widest text-zenit-gray uppercase">{product.kind}</p>
            <p className="font-display text-2xl leading-tight text-zenit-black">{product.model ?? " "}</p>
          </div>
          {product.variant ? (
            <span className="mt-1 shrink-0 rounded-full border border-zenit-green px-2.5 py-0.5 text-xs font-semibold text-zenit-green">
              {product.variant}
            </span>
          ) : null}
        </div>

        {/* Foto sobre cuadrícula de plano, encuadre uniforme */}
        <div className="relative mx-5 mt-4 aspect-[4/3] overflow-hidden rounded-sm bg-zenit-gray-50 bg-[linear-gradient(var(--color-zenit-gray-200)_1px,transparent_1px),linear-gradient(90deg,var(--color-zenit-gray-200)_1px,transparent_1px)] bg-[size:24px_24px]">
          <div
            aria-hidden="true"
            className="absolute inset-x-[22%] bottom-[8%] h-[6%] rounded-[50%] bg-zenit-black/20 blur-md transition-all duration-500 group-hover:inset-x-[30%] group-hover:opacity-60 motion-reduce:transition-none"
          />
          <Image
            src={product.image.src}
            alt={product.image.alt}
            fill
            sizes="(min-width: 1024px) 24rem, (min-width: 640px) 45vw, 90vw"
            className="object-contain p-[9%] transition-transform duration-500 ease-out group-hover:-translate-y-3 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:scale-100"
          />
        </div>

        <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
          <h4 className="text-base leading-snug font-bold text-zenit-black">
            <Link
              href={`/productos/${product.slug}`}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {product.name}
            </Link>
          </h4>

          {product.facts.length > 0 ? (
            <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-zenit-gray-200 pt-4">
              {product.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-[0.7rem] text-zenit-gray">{fact.label}</dt>
                  <dd className="font-display text-base leading-tight text-zenit-black sm:text-lg">{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <span aria-hidden="true" className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-zenit-green">
            Ver ficha
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
          </span>
        </div>

        {/* Barra verde que recorre la base al pasar el mouse */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-zenit-green transition-transform duration-500 group-hover:scale-x-100 group-has-focus-visible:scale-x-100 motion-reduce:transition-none"
        />
      </article>
    </motion.li>
  );
}

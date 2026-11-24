import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import type { CardProduct } from "@/lib/card-data";

/**
 * Tarjeta de catálogo (propuesta C aprobada, en grilla). Foto grande con el modelo
 * y la variante como etiquetas; al pasar el mouse entra una banda verde diagonal
 * (ángulo de las alas) detrás del producto. Cifras clave como chips.
 * Toda la tarjeta es un solo enlace a la ficha (por el título).
 */
export function ProductCard({
  product,
  headingLevel = "h4",
}: {
  product: CardProduct;
  headingLevel?: "h2" | "h3" | "h4";
}) {
  const Heading = headingLevel;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-zenit-white shadow-[0_0_0_1px_var(--color-zenit-gray-200)] transition-shadow duration-300 hover:shadow-[0_24px_48px_-28px_rgb(0_0_0/0.5),0_0_0_1px_var(--color-zenit-green)] has-focus-visible:shadow-[0_0_0_3px_var(--color-zenit-green)] motion-reduce:transition-none">
      <div className="relative aspect-square overflow-hidden bg-zenit-gray-50">
        {/* Banda diagonal verde que entra al pasar el mouse */}
        <div
          aria-hidden="true"
          className="absolute inset-x-[-30%] top-[30%] h-[34%] -translate-x-full -skew-y-[24deg] bg-zenit-green transition-transform duration-500 ease-out group-hover:translate-x-0 group-has-focus-visible:translate-x-0 motion-reduce:transition-none"
        />
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 45vw, 92vw"
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
        <Heading className="text-base leading-snug font-bold text-zenit-black">
          <Link
            href={`/productos/${product.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {product.name}
          </Link>
        </Heading>
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
          {site.catalog.viewProduct}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
        </span>
      </div>
    </article>
  );
}

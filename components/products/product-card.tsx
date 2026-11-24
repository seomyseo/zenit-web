import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import type { Product } from "@/lib/products";

/** Evita cortes de línea dentro de rangos como "110-220 V" o "20-40 PSI" (guion no separable). */
function keepRangesTogether(text: string) {
  return text.replace(/(\d)-(\d)/g, "$1‑$2");
}

/**
 * Tarjeta de catálogo. En móvil es horizontal y compacta (foto a la izquierda);
 * desde sm, vertical. Toda la tarjeta es un solo enlace a la ficha (por el título).
 */
export function ProductCard({
  product,
  headingLevel = "h4",
}: {
  product: Product;
  headingLevel?: "h2" | "h3" | "h4";
}) {
  const Heading = headingLevel;
  const image = product.images[0]!;
  return (
    <article className="group relative flex h-full overflow-hidden rounded-sm border border-border bg-zenit-white transition-[border-color,box-shadow] focus-within:border-zenit-green hover:border-zenit-green hover:shadow-[0_8px_24px_-12px_rgb(0_0_0/0.25)] sm:flex-col">
      <div className="flex w-28 shrink-0 items-center bg-zenit-gray-50 sm:block sm:w-auto">
        <Image
          src={image.src}
          alt={image.alt}
          width={1200}
          height={1200}
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 45vw, 7rem"
          className="aspect-square w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:p-6"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col border-l border-border p-4 sm:border-t sm:border-l-0 sm:p-5">
        {product.model ? (
          <p className="text-xs font-semibold tracking-wider text-zenit-gray uppercase">
            {product.model}
          </p>
        ) : null}
        <Heading className="mt-0.5 text-[0.95rem] leading-snug font-bold text-zenit-black sm:mt-1 sm:text-base">
          <Link
            href={`/productos/${product.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:-outline-offset-3 focus-visible:after:outline-zenit-green"
          >
            {keepRangesTogether(product.name)}
          </Link>
        </Heading>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-zenit-gray sm:mt-2">
          {product.shortDescription}
        </p>
        <span
          aria-hidden="true"
          className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-zenit-green sm:pt-4"
        >
          {site.catalog.viewProduct}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </span>
      </div>
    </article>
  );
}

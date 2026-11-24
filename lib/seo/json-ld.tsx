import { site } from "@/content/site";
import { publicEnv } from "@/lib/env";
import type { Product } from "@/lib/products";

export const absoluteUrl = (path: string) => new URL(path, publicEnv.NEXT_PUBLIC_SITE_URL).toString();

/** Inserta JSON-LD. Escapa "<" para que el contenido no pueda cerrar el <script>. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }}
    />
  );
}

/** Inversiones Lefre como organización, con Zenit como marca. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.owner.url}/#organization`,
    name: site.owner.name,
    url: site.owner.url,
    sameAs: [site.instagram.url],
    brand: {
      "@type": "Brand",
      name: site.name,
      url: absoluteUrl("/"),
      logo: absoluteUrl("/brand/zenit-color.svg"),
      slogan: "TECNOLOGÍA DE ALTURA",
    },
  };
}

/** Product sin offers ni precio (BRIEF, sección 8). */
export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: product.images.map((image) => absoluteUrl(image.src)),
    sku: product.erpCode,
    ...(product.model ? { mpn: product.model } : {}),
    url: absoluteUrl(`/productos/${product.slug}`),
    brand: { "@type": "Brand", name: site.name },
    manufacturer: { "@id": `${site.owner.url}/#organization`, "@type": "Organization", name: site.owner.name },
  };
}

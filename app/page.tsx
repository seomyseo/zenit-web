import type { Metadata } from "next";
import { Catalog } from "@/components/home/catalog";
import { Hero } from "@/components/home/hero";
import { LeadSection } from "@/components/home/lead-section";
import { Quality } from "@/components/home/quality";
import { WhereToBuy } from "@/components/home/where-to-buy";
import { WhyZenit } from "@/components/home/why-zenit";
import { site } from "@/content/site";
import { getProductsByGroup, getPublishedProducts } from "@/lib/products";
import { JsonLd, organizationJsonLd } from "@/lib/seo/json-ld";

export function generateMetadata(): Metadata {
  const featured = getPublishedProducts().find((p) => p.erpCode === site.hero.featuredErpCode);
  return {
    title: { absolute: site.seo.homeTitle },
    description: site.seo.homeDescription,
    alternates: { canonical: "/" },
    openGraph: {
      title: site.seo.homeTitle,
      description: site.seo.homeDescription,
      url: "/",
      images: featured?.images[0]
        ? [{ url: featured.images[0].src, width: 1200, height: 1200, alt: featured.images[0].alt }]
        : undefined,
    },
  };
}

export default function Home() {
  const products = getPublishedProducts();
  const featured =
    products.find((product) => product.erpCode === site.hero.featuredErpCode) ?? products[0];
  if (!featured) throw new Error("No hay productos publicados");

  return (
    <main id="contenido" className="flex-1">
      <JsonLd data={organizationJsonLd()} />
      <Hero featured={featured} />
      <WhyZenit />
      <Catalog groups={getProductsByGroup()} />
      <Quality />
      <WhereToBuy />
      <LeadSection />
    </main>
  );
}

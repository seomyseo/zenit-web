import type { Metadata } from "next";
import { Catalog } from "@/components/home/catalog";
import { HeroAltura } from "@/components/home/hero-altura";
import { LeadSection } from "@/components/home/lead-section";
import { Quality } from "@/components/home/quality";
import { SolarBanner } from "@/components/home/solar-banner";
import { WhereToBuy } from "@/components/home/where-to-buy";
import { WhyZenit } from "@/components/home/why-zenit";
import { site } from "@/content/site";
import { getHeroSlides } from "@/lib/hero-data";
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
  const { hero, tagline, solarBanner } = site;
  const products = getPublishedProducts();

  const solarKit = products.find((p) => p.erpCode === solarBanner.featuredErpCode);
  if (!solarKit?.images[0]) throw new Error(`Falta el kit solar ${solarBanner.featuredErpCode}`);
  // Kits solares: los que incluyen paneles (dato de la ficha, no del nombre).
  const kits = products
    .filter((p) => p.includes?.some((item) => /panel/i.test(item)))
    .map((p) => ({ slug: p.slug, model: p.model, name: p.name }));

  return (
    <main id="contenido" className="flex-1">
      <JsonLd data={organizationJsonLd()} />
      <HeroAltura
        id="inicio"
        eyebrow={hero.eyebrow}
        title={hero.title}
        lead={hero.lead}
        tagline={tagline}
        primaryCta={hero.primaryCta}
        secondaryCta={hero.secondaryCta}
        slides={getHeroSlides()}
      />
      <WhyZenit />
      <Catalog groups={getProductsByGroup()} />
      <Quality />
      <WhereToBuy />
      <SolarBanner
        eyebrow={solarBanner.eyebrow}
        title={solarBanner.title}
        lead={solarBanner.lead}
        primaryCta={solarBanner.primaryCta}
        secondaryCta={solarBanner.secondaryCta}
        kitsLabel={solarBanner.kitsLabel}
        kits={kits}
        image={solarKit.images[0]}
      />
      <LeadSection />
    </main>
  );
}

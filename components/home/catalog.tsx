import { WingMotif } from "@/components/brand/wing-motif";
import { Reveal } from "@/components/motion/reveal";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";
import { GROUP_LABELS, type Product, type ProductGroup } from "@/lib/products";

type CatalogProps = {
  groups: { group: ProductGroup; products: Product[] }[];
  /** En /productos el título de página es el H1; en la home, H2. */
  headingLevel?: "h1" | "h2";
};

export function Catalog({ groups, headingLevel = "h2" }: CatalogProps) {
  const Heading = headingLevel;
  const GroupHeading = headingLevel === "h1" ? "h2" : "h3";
  const cardHeading = headingLevel === "h1" ? "h3" : "h4";
  const { catalog } = site;

  return (
    <section id="productos" aria-labelledby="catalog-title" className="bg-zenit-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <header className="max-w-2xl">
          <p className="flex items-center gap-3 text-sm font-semibold tracking-wide text-zenit-green uppercase">
            <WingMotif height={12} />
            {catalog.eyebrow}
          </p>
          <Heading
            id="catalog-title"
            className="mt-3 font-display text-3xl leading-tight text-zenit-black sm:text-4xl"
          >
            {catalog.title}
          </Heading>
          <p className="mt-3 text-base leading-relaxed text-zenit-gray">{catalog.lead}</p>
        </header>

        {groups.map(({ group, products }) => (
          <div key={group} className="mt-12" data-group={group}>
            <GroupHeading className="flex items-baseline gap-3 border-b-2 border-zenit-black pb-3 text-xl font-bold text-zenit-black sm:text-2xl">
              {GROUP_LABELS[group]}
              <span className="text-base font-semibold text-zenit-gray">({products.length})</span>
            </GroupHeading>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {products.map((product, index) => (
                <Reveal as="li" key={product.erpCode} delay={Math.min(index, 6) * 0.04}>
                  <ProductCard product={product} headingLevel={cardHeading} />
                </Reveal>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-zenit-black text-zenit-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-5 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <WingMotif height={28} className="hidden sm:inline-block" />
            <p className="text-xl font-bold sm:text-2xl">
              {catalog.band.title}{" "}
              <span className="font-medium text-zenit-white/85">{catalog.band.text}</span>
            </p>
          </div>
          <Button asChild size="xl" className="shrink-0">
            <a href={catalog.band.cta.href}>{catalog.band.cta.label}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

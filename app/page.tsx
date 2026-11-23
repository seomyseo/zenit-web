import { Catalog } from "@/components/home/catalog";
import { Hero } from "@/components/home/hero";
import { SiteHeader } from "@/components/site/header";
import { site } from "@/content/site";
import { getProductsByGroup, getPublishedProducts } from "@/lib/products";

export default function Home() {
  const products = getPublishedProducts();
  const featured =
    products.find((product) => product.erpCode === site.hero.featuredErpCode) ?? products[0];
  if (!featured) throw new Error("No hay productos publicados");

  return (
    <>
      <SiteHeader />
      <main id="contenido" className="flex-1">
        <Hero featured={featured} />
        <Catalog groups={getProductsByGroup()} />
      </main>
    </>
  );
}

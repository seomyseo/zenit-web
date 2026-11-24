import type { Metadata } from "next";
import { Catalog } from "@/components/home/catalog";
import { site } from "@/content/site";
import { getProductsByGroup } from "@/lib/products";

export const metadata: Metadata = {
  title: site.productsPage.title,
  description: site.productsPage.description,
  alternates: { canonical: "/productos" },
  openGraph: {
    title: `${site.productsPage.title} | Zenit`,
    description: site.productsPage.description,
    url: "/productos",
  },
};

export default function ProductsPage() {
  return (
    <main id="contenido" className="flex-1">
      <Catalog groups={getProductsByGroup()} headingLevel="h1" />
    </main>
  );
}

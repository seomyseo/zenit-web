import { Check, ChevronRight, Download, Handshake } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadCta, productLeadMessage } from "@/components/leads/lead-cta";
import { ProductCard } from "@/components/products/product-card";
import { toCard } from "@/lib/card-data";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";
import { getImageSize } from "@/lib/image-size";
import { GROUP_LABELS, getProductBySlug, getPublishedProducts, getRelatedProducts } from "@/lib/products";
import { JsonLd, productJsonLd } from "@/lib/seo/json-ld";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/productos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  const title = product.model ? `${product.name} (${product.model})` : product.name;
  const image = product.images[0];
  return {
    title,
    description: product.shortDescription,
    alternates: { canonical: `/productos/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${title} | Zenit`,
      description: product.shortDescription,
      url: `/productos/${product.slug}`,
      images: image ? [{ url: image.src, width: 1200, height: 1200, alt: image.alt }] : undefined,
    },
  };
}

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-base leading-relaxed text-zenit-black">
          <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-zenit-green" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default async function ProductPage({ params }: PageProps<"/productos/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const t = site.product;
  const related = getRelatedProducts(product);
  const datasheet = product.files?.find((file) => file.kind === "datasheet");
  const figures = await Promise.all(
    (product.files ?? [])
      .filter((file) => file.kind !== "datasheet")
      .map(async (file) => ({ ...file, ...(await getImageSize(file.src)) })),
  );
  const [mainImage, ...moreImages] = product.images;

  return (
    <main id="contenido" className="flex-1">
      <JsonLd data={productJsonLd(product)} />

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <nav aria-label="Ruta de navegación">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-zenit-gray">
            <li>
              <Link href="/" className="hover:text-zenit-green hover:underline">
                {t.breadcrumbHome}
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-4" />
            </li>
            <li>
              <Link href="/productos" className="hover:text-zenit-green hover:underline">
                {t.breadcrumbProducts}
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-4" />
            </li>
            <li aria-current="page" className="font-medium text-zenit-black">
              {product.name}
            </li>
          </ol>
        </nav>
      </div>

      {/* 1-3. Cabecera, galería y descripción */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-12">
        <div>
          <div className="overflow-hidden rounded-sm border border-border bg-zenit-gray-50">
            {mainImage ? (
              <Image
                src={mainImage.src}
                alt={mainImage.alt}
                width={1200}
                height={1200}
                priority
                sizes="(min-width: 1024px) 40rem, 92vw"
                className="aspect-square w-full object-contain p-6 sm:p-10"
              />
            ) : null}
          </div>
          {moreImages.length > 0 ? (
            <ul className="mt-3 grid grid-cols-4 gap-3">
              {moreImages.map((image) => (
                <li key={image.src} className="overflow-hidden rounded-sm border border-border bg-zenit-gray-50">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={1200}
                    height={1200}
                    sizes="10rem"
                    className="aspect-square w-full object-contain p-2"
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <p className="text-sm font-semibold tracking-wide text-zenit-green uppercase">
            {GROUP_LABELS[product.group]}
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight text-zenit-black sm:text-4xl">
            {product.name}
          </h1>
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            {product.model ? (
              <div className="flex gap-1.5">
                <dt className="text-zenit-gray">{t.model}:</dt>
                <dd className="font-semibold text-zenit-black">{product.model}</dd>
              </div>
            ) : null}
            <div className="flex gap-1.5">
              <dt className="text-zenit-gray">{t.code}:</dt>
              <dd className="font-semibold text-zenit-black">{product.erpCode}</dd>
            </div>
          </dl>
          <p className="mt-5 text-lg leading-relaxed text-zenit-black">{product.shortDescription}</p>

          {product.warranty ? (
            <p className="mt-5 flex items-start gap-2 rounded-sm bg-zenit-gray-50 px-4 py-3 text-sm text-zenit-black">
              <Handshake aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-zenit-green" />
              <span>
                <strong>{t.warranty}:</strong> {product.warranty}
              </span>
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <LeadCta message={productLeadMessage(product)} />
            {datasheet ? (
              <Button
                asChild
                size="xl"
                variant="outline"
                className="border-2 border-zenit-black bg-transparent text-zenit-black hover:bg-zenit-black hover:text-zenit-white"
              >
                <a href={datasheet.src} download>
                  <Download aria-hidden="true" />
                  {t.datasheet}
                </a>
              </Button>
            ) : null}
          </div>
          <p className="mt-3 text-sm text-zenit-gray">{t.noPrice}</p>
        </div>
      </section>

      {/* 3-4. Características, aplicaciones, incluye */}
      {product.features || product.applications || product.includes ? (
        <section className="border-t border-border bg-zenit-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
            {product.features ? (
              <div>
                <h2 className="text-xl font-bold text-zenit-black">{t.features}</h2>
                <Bullets items={product.features} />
              </div>
            ) : null}
            {product.applications ? (
              <div>
                <h2 className="text-xl font-bold text-zenit-black">{t.applications}</h2>
                <Bullets items={product.applications} />
              </div>
            ) : null}
            {product.includes ? (
              <div>
                <h2 className="text-xl font-bold text-zenit-black">{t.includes}</h2>
                <Bullets items={product.includes} />
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* 5. Especificaciones por bloque, en texto indexable */}
      {product.specGroups ? (
        <section aria-labelledby="specs-title" className="bg-zenit-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <h2 id="specs-title" className="font-display text-2xl text-zenit-black sm:text-3xl">
              {t.specs}
            </h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {product.specGroups.map((group) => (
                <div key={group.title} className="overflow-hidden rounded-sm border border-border bg-zenit-white">
                  <table className="w-full text-left text-sm">
                    <caption className="bg-zenit-green px-4 py-3 text-left text-sm font-semibold text-zenit-white">
                      {group.title}
                    </caption>
                    <tbody>
                      {group.rows.map((row) => (
                        <tr key={row.label} className="border-t border-border first:border-t-0">
                          <th scope="row" className="w-1/2 px-4 py-2.5 align-top font-medium text-zenit-gray">
                            {row.label}
                          </th>
                          <td className="px-4 py-2.5 align-top font-semibold text-zenit-black">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 6. Curva y diagrama de conexión como imágenes */}
      {figures.length > 0 ? (
        <section className="bg-zenit-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2">
            {figures.map((file) => (
              <figure key={file.src}>
                <h2 className="text-xl font-bold text-zenit-black">
                  {file.kind === "curve" ? t.curve : t.wiring}
                </h2>
                <div className="mt-4 overflow-hidden rounded-sm border border-border bg-zenit-white p-3">
                  <Image
                    src={file.src}
                    alt={`${file.label}. ${product.name}${product.model ? ` (${product.model})` : ""}`}
                    width={file.width}
                    height={file.height}
                    sizes="(min-width: 1024px) 40rem, 92vw"
                    className="h-auto w-full"
                  />
                </div>
                <figcaption className="mt-2 text-sm text-zenit-gray">{file.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {/* 7. CTA */}
      <section className="bg-zenit-black text-zenit-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-5 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p className="text-lg font-semibold sm:text-xl">{t.ctaText}</p>
          <div className="flex shrink-0 flex-col items-start gap-3 sm:flex-row sm:items-center">
            <LeadCta message={productLeadMessage(product)} />
            <Link
              href={`/?producto=${product.erpCode}#contacto`}
              className="inline-flex min-h-10 items-center text-sm font-semibold text-zenit-white underline underline-offset-4 hover:text-zenit-white/85"
            >
              {site.leadForm.productFormLink}
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Relacionados */}
      {related.length > 0 ? (
        <section aria-labelledby="related-title" className="bg-zenit-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
            <h2 id="related-title" className="font-display text-2xl text-zenit-black sm:text-3xl">
              {t.related}
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.erpCode}>
                  <ProductCard product={toCard(item)} headingLevel="h3" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );
}

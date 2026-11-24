import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/json-ld";
import { getPublishedProducts } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/productos"), changeFrequency: "monthly", priority: 0.9 },
    ...getPublishedProducts().map((product) => ({
      url: absoluteUrl(`/productos/${product.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: product.images.map((image) => absoluteUrl(image.src)),
    })),
  ];
}

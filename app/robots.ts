import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";
import { absoluteUrl } from "@/lib/seo/json-ld";

export const dynamic = "force-static";

/**
 * Indexación controlada (CLAUDE.md, Seguridad): solo con NEXT_PUBLIC_SITE_INDEXABLE=true
 * se permite indexar y se anuncia el sitemap. En cualquier otro caso, Disallow: /.
 */
export default function robots(): MetadataRoute.Robots {
  if (!publicEnv.NEXT_PUBLIC_SITE_INDEXABLE) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/lab/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}

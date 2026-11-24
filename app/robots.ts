import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/json-ld";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/lab/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}

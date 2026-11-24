import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // La API de leads valida los códigos de producto leyendo los JSON en tiempo de ejecución.
  outputFileTracingIncludes: {
    "/api/leads": ["./content/products/*.json"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

/**
 * Fase estática (CLAUDE.md, "Alcance de esta fase"): `next build` genera out/ con
 * HTML puro, que nginx sirve. Sin servidor no hay optimización de imágenes: las fotos
 * se preparan ya comprimidas (pnpm assets:products). Para la fase de automatizaciones
 * se vuelve a output: "standalone".
 */
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
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

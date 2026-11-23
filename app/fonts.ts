import { Montserrat, Roboto_Slab } from "next/font/google";

/**
 * Fuentes de la web (CLAUDE.md). Rockwell no tiene licencia: Roboto Slab la sustituye.
 * Se sirven desde el propio sitio (next/font descarga en build), nunca desde un CDN.
 */

/** Cuerpo, navegación, botones y UI. Variable (400-800) + itálica para el lema. */
export const montserrat = Montserrat({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-montserrat",
});

/** Titulares de impacto. Un solo peso. */
export const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
  variable: "--font-roboto-slab",
});

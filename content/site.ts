/**
 * Textos editables del sitio (borradores en español de Venezuela).
 * Los componentes no llevan textos sueltos: todo lo visible sale de aquí.
 */

export const site = {
  name: "Zenit",
  tagline: "Tecnología de altura",
  owner: {
    name: "Inversiones Lefre",
    url: "https://lefre.com.ve",
  },

  nav: [
    { label: "Inicio", href: "/#inicio" },
    { label: "Productos", href: "/#productos" },
    { label: "Por qué Zenit", href: "/#por-que-zenit" },
    { label: "Dónde comprar", href: "/#donde-comprar" },
    { label: "Contacto", href: "/#contacto" },
  ],

  header: {
    cta: { label: "Quiero distribuir Zenit", href: "/#contacto" },
    distributedBy: "Distribuido por Inversiones Lefre",
    menuLabel: "Abrir menú",
    menuTitle: "Menú",
    skipToContent: "Saltar al contenido",
    homeLabel: "Zenit, ir al inicio",
  },

  hero: {
    eyebrow: "Marca de Inversiones Lefre",
    title: "Bombas de agua y refrigerantes Zenit, con respaldo nacional",
    lead: "Bombas solares y eléctricas, presostatos, control de presión y refrigerantes para ferreterías y distribuidores de toda Venezuela.",
    primaryCta: { label: "Ver productos", href: "#productos" },
    secondaryCta: { label: "Quiero distribuir Zenit", href: "#contacto" },
    /** erpCode del producto estrella cuya foto va en el hero. */
    featuredErpCode: "0021-0318",
    highlights: [
      "Línea agrícola y automotriz",
      "Más de 80 vendedores en todo el país",
      "Garantía de 1 año en bombas",
    ],
  },

  catalog: {
    eyebrow: "Catálogo",
    title: "Productos Zenit",
    lead: "Datos técnicos claros para cada producto. Sin precios: pídelos a tu vendedor Lefre.",
    viewProduct: "Ver ficha",
    band: {
      title: "¿Eres ferretero?",
      text: "Pide Zenit a tu vendedor o regístrate.",
      cta: { label: "Quiero distribuir Zenit", href: "#contacto" },
    },
  },
} as const;

export type Site = typeof site;

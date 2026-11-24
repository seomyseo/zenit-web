/**
 * Textos editables del sitio (borradores en español de Venezuela).
 * Los componentes no llevan textos sueltos: todo lo visible sale de aquí.
 * Datos de contacto (teléfono, correo, WhatsApp): pendientes del cliente; no inventar.
 */

export const site = {
  name: "Zenit",
  domain: "zenit.com.ve",
  tagline: "Tecnología de altura",
  owner: {
    name: "Inversiones Lefre",
    url: "https://lefre.com.ve",
  },
  instagram: {
    handle: "@lefrevzla",
    url: "https://www.instagram.com/lefrevzla/",
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
    newTab: "(abre en una pestaña nueva)",
  },

  hero: {
    eyebrow: "Marca de Inversiones Lefre",
    title: "Bombas de agua y refrigerantes Zenit, con respaldo nacional",
    lead: "Bombas solares y eléctricas, presostatos, control de presión y refrigerantes para ferreterías y distribuidores de toda Venezuela.",
    primaryCta: { label: "Ver productos", href: "/#productos" },
    secondaryCta: { label: "Quiero distribuir Zenit", href: "/#contacto" },
    /** erpCode del producto estrella cuya foto va en el hero. */
    featuredErpCode: "0021-0318",
  },

  why: {
    eyebrow: "Por qué Zenit",
    title: "Una marca nacional, con respaldo cerca de tu ferretería",
    points: [
      {
        icon: "building",
        title: "Marca de Inversiones Lefre",
        text: "Zenit es la marca propia de Inversiones Lefre, mayorista de ferretería en Venezuela.",
      },
      {
        icon: "map",
        title: "En todo el país",
        text: "Más de 80 vendedores en calle llevan Zenit a ferreterías y distribuidores de todo el territorio.",
      },
      {
        icon: "file",
        title: "Fichas técnicas claras",
        text: "Cada producto tiene sus datos técnicos publicados, para vender con información y sin adivinar.",
      },
      {
        icon: "wrench",
        title: "Garantía de 1 año en bombas",
        text: "Garantía directa a través del distribuidor.",
      },
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
      cta: { label: "Quiero distribuir Zenit", href: "/#contacto" },
    },
  },

  quality: {
    eyebrow: "Calidad y respaldo",
    title: "Garantía directa y el respaldo de Inversiones Lefre",
    paragraphs: [
      "Las bombas Zenit tienen garantía de 1 año, directa por el distribuidor: si algo falla, lo resuelves con quien te vendió.",
      "Detrás de Zenit está Inversiones Lefre, con distribución en todo el país y atención por medio de su red de vendedores.",
    ],
    facts: [
      { value: "1 año", label: "de garantía en bombas" },
      { value: "+80", label: "vendedores en calle" },
    ],
  },

  whereToBuy: {
    eyebrow: "Dónde comprar",
    title: "Zenit llega a tu ferretería en tres pasos",
    steps: [
      {
        title: "Pídelo a tu vendedor Lefre",
        text: "En su próxima visita, pide los productos Zenit que necesitas.",
      },
      {
        title: "¿Aún no eres cliente?",
        text: "Regístrate como ferretería o distribuidor con el formulario de esta página.",
      },
      {
        title: "Próximamente, pedidos en línea",
        text: "Podrás hacer tu pedido en el portal de lefre.com.ve.",
      },
    ],
    coverage: "Cobertura nacional a través de la red de distribución de Inversiones Lefre.",
    ownerCta: "Conoce Inversiones Lefre",
  },

  /** Banner antes del formulario: concepto "El sol mueve el agua". */
  solarBanner: {
    eyebrow: "Bombeo solar",
    title: "Agua con la energía del sol",
    lead: "Bombas solares Zenit para el campo y el hogar, y toda una línea de bombas y refrigerantes con respaldo nacional.",
    primaryCta: { label: "Ver bombas solares", href: "/#productos" },
    secondaryCta: { label: "Soy ferretero", href: "/#contacto" },
    kitsLabel: "Kits solares",
    /** erpCode del kit cuya foto va en el banner. */
    featuredErpCode: "0021-0318",
  },

  leadForm: {
    eyebrow: "Contacto",
    title: "Quiero distribuir Zenit",
    lead: "Déjanos tus datos y un asesor de Inversiones Lefre te contactará para que tengas Zenit en tu ferretería.",
    aside: {
      title: "Habla con nosotros",
      text: "Atendemos a ferreterías y distribuidores de toda Venezuela a través de la red de Inversiones Lefre.",
      coverage: "Cobertura nacional",
      website: "lefre.com.ve",
    },
    card: {
      title: "Envía tus datos",
      text: "Completa el formulario y te contactaremos.",
    },
    fields: {
      name: { label: "Nombre y apellido", autoComplete: "name" },
      company: { label: "Empresa o ferretería", autoComplete: "organization" },
      city: { label: "Ciudad", autoComplete: "address-level2" },
      phone: { label: "Teléfono", autoComplete: "tel", hint: "Con código de área, por ejemplo 0414 123 4567" },
      email: { label: "Correo electrónico", autoComplete: "email" },
      message: {
        label: "Mensaje",
        hint: "Opcional. Cuéntanos qué productos te interesan o qué necesitas.",
        /** Texto inicial cuando se llega desde una ficha de producto. */
        prefill: "Me interesa: {producto}.",
      },
    },
    consent: "Al enviar, aceptas que Inversiones Lefre te contacte.",
    submit: "Enviar solicitud",
    sending: "Enviando…",
    success: {
      title: "¡Gracias! Recibimos tu solicitud.",
      text: "Un asesor de Inversiones Lefre te contactará pronto.",
      again: "Enviar otra solicitud",
    },
    errors: {
      generic: "No pudimos enviar tu solicitud. Inténtalo de nuevo en unos minutos.",
      network: "No hay conexión. Revisa tu internet e inténtalo de nuevo.",
      fields: "Revisa los campos marcados.",
    },
    whatsapp: "Escríbenos por WhatsApp",
  },

  footer: {
    brandLine: "Marca de Inversiones Lefre",
    links: [
      { label: "Productos", href: "/productos" },
      { label: "Dónde comprar", href: "/#donde-comprar" },
      { label: "Contacto", href: "/#contacto" },
    ],
    contactTitle: "Contacto",
    linksTitle: "Navegación",
    instagramLabel: "Instagram",
    rights: "Zenit es una marca de Inversiones Lefre.",
  },

  product: {
    breadcrumbHome: "Inicio",
    breadcrumbProducts: "Productos",
    code: "Código",
    model: "Modelo",
    features: "Características",
    applications: "Aplicaciones",
    includes: "Incluye",
    warranty: "Garantía",
    specs: "Especificaciones técnicas",
    curve: "Curva de rendimiento",
    wiring: "Diagrama de conexión",
    datasheet: "Descargar ficha técnica (PDF)",
    cta: "Quiero distribuir Zenit",
    ctaText: "¿Te interesa este producto para tu ferretería? Te contactamos.",
    related: "Productos relacionados",
    noPrice: "Consulta disponibilidad con tu vendedor Lefre.",
  },

  productsPage: {
    title: "Productos Zenit",
    description:
      "Catálogo Zenit: bombas de agua solares y eléctricas, presostatos, control de presión y refrigerantes para ferreterías en Venezuela.",
  },

  notFound: {
    title: "Página no encontrada",
    text: "La página que buscas no existe o cambió de dirección.",
    cta: "Ver productos",
  },

  seo: {
    homeTitle: "Zenit | Bombas de agua y refrigerantes para ferreterías en Venezuela",
    homeDescription:
      "Zenit, marca de Inversiones Lefre: bombas de agua solares y eléctricas, presostatos, control de presión y refrigerantes con distribución nacional.",
  },
} as const;

export type Site = typeof site;

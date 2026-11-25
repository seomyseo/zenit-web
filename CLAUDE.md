# CLAUDE.md: zenit.com.ve

Sitio de marca de **Zenit**, marca propia de Inversiones Lefre (mayorista de ferretería en Venezuela). Qué se construye, rutas, datos de producto y criterios de aceptación: `BRIEF-ZENIT.md`. Este archivo fija stack, marca y reglas de trabajo.

- Textos de la web en español (Venezuela). Código, campos y rutas de datos en inglés.
- Mensajes de commit en español, formato convencional (`feat:`, `fix:`, `chore:`).

## Alcance de esta fase

**Sitio 100 % estático, sin automatizaciones.** Esta fase publica la web de marca y el catálogo informativo. Quedan fuera por ahora, y no se implementan hasta que se indique: `/api/leads`, webhook de n8n, formularios con envío, base de datos y cualquier proceso de servidor. El único canal de contacto es WhatsApp. Cuando lleguen las automatizaciones se vuelve a `output: "standalone"` sin rehacer el diseño (ver "Captación" más abajo).

## Stack

- Next.js (App Router) + TypeScript estricto + Tailwind CSS + shadcn/ui + Motion.
- **Exportación estática**: `output: "export"` en `next.config` y `images: { unoptimized: true }` (la optimización de imágenes de Next necesita servidor). El resultado es la carpeta `out/` con HTML puro. No usar nada que requiera servidor: route handlers dinámicos, middleware, Server Actions, `revalidate`, `cookies()` ni `headers()`. Todas las rutas dinámicas con `generateStaticParams`; `sitemap.ts` y `robots.ts` con `export const dynamic = "force-static"`.
- Zod para validar los datos de producto. **Sin base de datos por ahora**: los productos son archivos JSON (ver el brief). No agregar Postgres, ORM ni migraciones.
- Gestor de paquetes: el que ya use el repo; si es nuevo, pnpm.
- Despliegue: Docker + Traefik. Imagen multietapa: build con pnpm y `out/` servido con nginx alpine. `Dockerfile` y `docker-compose.yml` en la raíz, con un README de despliegue para repetirlo en un VPS nuevo.
  - Se prueba primero en el VPS propio de VeneTecnologías, con `zenit.com.ve` apuntando a él. Después se mueve al VPS que contrate el cliente: solo cambia el registro A del DNS.
  - El dominio está en nic.ve y no tiene correo (sin registros MX): no hay nada que preservar. Antes de cambiar DNS, anotar los registros actuales.
  - Mientras el sitio no esté aprobado, se protege con `SITE_INDEXABLE=false` (ver "Seguridad") y, opcionalmente, un middleware `basicAuth` de Traefik controlado por variable de entorno.

Scripts que debe tener `package.json`: `dev`, `build`, `start` (sirve `out/` en local para revisar el resultado final), `lint`, `typecheck`, `test`. Antes de dar algo por terminado: `lint`, `typecheck` y `build` sin errores, y comprobar que `out/` se genera completo.

## Marca Zenit

Fuente: manual de marca `Logo_Zenit_5x5_2.pdf` (copiar a `content/source/brand/`). El logo es un **águila** sobre la palabra ZENIT. El lema oficial es **TECNOLOGÍA DE ALTURA**.

### Logo
Cuatro versiones oficiales, todas en las páginas 1 a 4 del PDF:

| Versión | Usar sobre |
| --- | --- |
| Color (águila con franjas verdes, texto negro) | Fondo blanco o muy claro |
| Negro | Fondo blanco cuando no se use color |
| Blanco | Fondo negro o verde `#02682E` |
| Gris `#575756` | Usos discretos (footer, marcas de agua) |

- Extraer los logos del PDF como vectores (`pdftocairo -svg`) a `public/brand/` y usarlos como SVG. **No redibujar ni recrear el logo** y no deformarlo, rotarlo ni cambiarle los colores.
- Dejar libre alrededor del logo al menos la altura de la "Z" de ZENIT.
- El texto "ZENIT" del logo es parte del logo: no se escribe con una fuente, se usa el SVG.

### Colores (únicos de la marca)

| Token | Hex | Uso |
| --- | --- | --- |
| `zenit-green` | `#02682E` | Acento, botones primarios, enlaces, íconos |
| `zenit-black` | `#000000` | Fondos oscuros, texto principal |
| `zenit-gray` | `#575756` | Texto secundario, bordes, detalles |
| `zenit-white` | `#FFFFFF` | Fondos y texto sobre oscuro |

Tailwind v4 (`app/globals.css`); las variables de shadcn/ui (`--primary`, `--foreground`, etc.) se mapean a estos tokens:

```css
@theme {
  --color-zenit-green: #02682e;
  --color-zenit-black: #000000;
  --color-zenit-gray: #575756;
  --color-zenit-white: #ffffff;
}
```

Contraste medido (WCAG): verde sobre blanco 6,95:1 (sirve para texto), gris sobre blanco 7,23:1 (sirve), **verde sobre negro 3,02:1 y gris sobre negro 2,90:1 (solo para elementos grandes o decorativos, nunca texto de cuerpo)**. Texto sobre fondo negro: blanco. Si hace falta un tono derivado (hover, bordes suaves), sacarlo del verde o el gris existentes y no introducir otros colores de marca.

### Tipografía
- El manual define la tipografía de la marca como **Rockwell** (slab serif), la del nombre ZENIT. **No hay licencia de Rockwell: no usarla ni incrustarla en la web.** El nombre ZENIT va siempre como parte del logo SVG.
- Fuentes de la web (decisión cerrada), cargadas con `next/font/google`:
  - **Roboto Slab:** titulares de impacto (sustituye a Rockwell por su aspecto slab).
  - **Montserrat:** cuerpo, navegación, botones y UI.
  - **Montserrat ExtraBold Italic en mayúsculas:** el lema "TECNOLOGÍA DE ALTURA", en blanco sobre negro, o verde, gris o negro sobre blanco.
- Cargar solo los pesos que se usen, con `display: swap`, y nunca desde un CDN externo en tiempo de ejecución.

### Dirección visual (propuesta, no es parte del manual)
Industrial, técnica y sobria: fondos blancos y negros con el verde como acento, mucho aire, fichas legibles. Ferreteros y distribuidores buscan datos rápidos, así que la claridad pesa más que el adorno. El águila y la idea de "altura" pueden aparecer como motivo gráfico (por ejemplo, las franjas del águila como separadores), siempre derivado del logo oficial.

## Diseño y animación
- Mobile first: se verá sobre todo en el teléfono. Probar a 360 px.
- Animación con Motion, con propósito. Dirección aprobada por el cliente: concepto **"Altura"** (hero A: rotación de productos, corte diagonal verde, cifras que suben, lema con paralaje) y banner solar (sol que sube con el scroll y línea de agua). Fuera de esas piezas, movimiento sutil (entradas de sección, hover).
- Siempre: respetar `prefers-reduced-motion` (sin rotación automática, sin paralaje, valores finales a la vista); no animar la entrada del H1 ni de la imagen principal (LCP); no agregar GSAP ni Lenis sin una razón concreta.
- Componentes: partir de shadcn/ui; 21st.dev y el MCP de shadcn para generar piezas; ajustar siempre a los tokens de arriba.
- Imágenes con `next/image` (sin optimización, ver Stack), `alt` descriptivo y tamaños explícitos. Las imágenes de producto son las de `content/source/`. Preparar las fotos ya redimensionadas y comprimidas, porque en un sitio estático nadie las optimiza al vuelo.
- Accesibilidad: foco visible, navegación por teclado, jerarquía de encabezados correcta, contraste según la tabla de arriba.
- **Pulido visual en pausa.** Los ajustes de diseño de la home (hero, etiquetas de variación, encuadre de fotos, movimiento) los decide el cliente más adelante y se registran en `content/DISENO-PENDIENTE.md`. No aplicarlos hasta que se indique. Mientras tanto, usar estilos sobrios con los componentes existentes.

## Datos y contenido
- Productos: `content/products/<slug>.json`, validados con Zod (esquema en el brief). **No inventar datos técnicos**: si no está en la ficha, la fila no existe.
- Los textos editables de la web viven en un solo archivo (`content/site.ts`), no dispersos en los componentes.
- **Sin precios en ningún lugar de la web.** Sin certificaciones ni sellos (Zenit no los tiene). La garantía es de **1 año en las bombas** (la que declara su empaque), directa por el distribuidor. No mencionar garantía en las fichas de refrigerantes, presostatos ni control hasta que el cliente la confirme para ellos.
- **Afirmaciones ecológicas:** solo se respaldan en las bombas solares (ZBC-002S, ZBP-001S, ZBS-001S), que funcionan con paneles. No escribir "ecológico", "sostenible" ni similares para las bombas eléctricas, presostatos o refrigerantes, y no presentar la marca entera como ecológica.
- Lo que se omite o se corrige por ahora de las fichas se registra en `content/PENDIENTES.md`.

## Captación (WhatsApp)
- El contacto es un CTA a WhatsApp con mensaje precargado (por ejemplo, "Soy ferretero de [ciudad] y quiero distribuir Zenit"), usando `NEXT_PUBLIC_WHATSAPP_URL`.
- Todo el código de captación vive aislado en un único componente (`LeadCta`), para poder sustituirlo más adelante por un formulario con webhook sin tocar el resto.
- No crear `/api/leads`, ni formulario con envío, ni usar `LEADS_WEBHOOK_URL` en esta fase.

## Herramientas de verificación
- **Playwright** (MCP y pruebas en `tests/`): comprobar visualmente cada sección terminada en móvil y escritorio, y probar que el CTA de WhatsApp abre el enlace con el mensaje correcto.
- **Context7**: consultar la documentación actual de Next.js, Tailwind, shadcn/ui y Motion antes de usar APIs que no se recuerden con seguridad.
- **Strix**: auditoría de seguridad antes de entregar el sitio al cliente (cabeceras, dependencias, configuración de nginx y Traefik).
- **Lighthouse** móvil ≥ 90 en las cuatro categorías.

## Seguridad
- Secretos solo en variables de entorno; `.env` fuera de git y `.env.example` actualizado.
- **Indexación controlada:** `NEXT_PUBLIC_SITE_INDEXABLE` (por defecto `false`). Si es `false`, todas las páginas llevan `<meta name="robots" content="noindex, nofollow">` y `robots.txt` devuelve `Disallow: /`; el sitemap no se publica. Se cambia a `true` solo al lanzar. Al ser estático, es una variable de build: hay que reconstruir la imagen para cambiarla.
- Cabeceras de seguridad en la configuración de nginx (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` o CSP) y HTTPS forzado desde Traefik.
- Cuando se reactive `/api/leads` (fase de automatizaciones): validar en servidor, honeypot, límite de intentos por IP, nunca devolver detalles internos en los errores, y no registrar en logs teléfonos ni emails.

## No hacer
- No cambiar logo, colores ni tipografías de marca por gusto propio.
- No usar el lema "Impulsando el mañana con la energía de hoy" en el sitio: aparece en las fichas de las bombas, pero el lema oficial, confirmado por el cliente, es TECNOLOGÍA DE ALTURA.
- No agregar login, carrito, precios, blog ni filtros (fuera de alcance, ver el brief).
- No agregar rutas de API, procesos de servidor ni integraciones (n8n, webhooks, bases de datos) en esta fase.
- No instalar dependencias pesadas para algo que se resuelve con CSS.

## Pendientes de marca
- Zenit no tiene aún cuenta propia de Instagram: se enlaza @lefrevzla.

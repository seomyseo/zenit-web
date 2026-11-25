# CLAUDE.md: zenit.com.ve

Sitio de marca de **Zenit**, marca propia de Inversiones Lefre (mayorista de ferretería en Venezuela). Qué se construye, rutas, datos de producto y criterios de aceptación: `BRIEF-ZENIT.md`. Este archivo fija stack, marca y reglas de trabajo.

- Textos de la web en español (Venezuela). Código, campos y rutas de datos en inglés.
- Mensajes de commit en español, formato convencional (`feat:`, `fix:`, `chore:`).

## Alcance de esta fase

**Sitio estático con un único servicio de servidor: el envío del formulario de contacto por correo.** Esta fase publica la web de marca y el catálogo informativo. El sitio sigue siendo `output: "export"` servido por nginx; el formulario de contacto envía un correo a `mercadeo@lefre.com.ve` a través de un contenedor pequeño aparte (`zenit-api`, ver "Captación"). Quedan fuera por ahora, y no se implementan hasta que se indique: webhook de n8n, automatizaciones, base de datos y cualquier otro proceso de servidor. Canales de contacto: formulario por correo y botón de WhatsApp. El sitio está **indexable** en producción (ver "Seguridad").

## Stack

- Next.js (App Router) + TypeScript estricto + Tailwind CSS + shadcn/ui + Motion.
- **Exportación estática**: `output: "export"` en `next.config` y `images: { unoptimized: true }` (la optimización de imágenes de Next necesita servidor). El resultado es la carpeta `out/` con HTML puro. No usar nada que requiera servidor: route handlers dinámicos, middleware, Server Actions, `revalidate`, `cookies()` ni `headers()`. Todas las rutas dinámicas con `generateStaticParams`; `sitemap.ts` y `robots.ts` con `export const dynamic = "force-static"`.
- Zod para validar los datos de producto. **Sin base de datos por ahora**: los productos son archivos JSON (ver el brief). No agregar Postgres, ORM ni migraciones.
- Gestor de paquetes: el que ya use el repo; si es nuevo, pnpm.
- Despliegue: Docker + Traefik. Imagen multietapa: build con pnpm y `out/` servido con nginx alpine. `Dockerfile` y `docker-compose.yml` en la raíz, con un README de despliegue para repetirlo en un VPS nuevo.
  - Segundo servicio en el mismo `docker-compose.yml`: `zenit-api` (Node, solo envío del formulario por SMTP), en la red `traefik`, sin puertos publicados. Traefik le envía las peticiones a `/api/` y todo lo demás va a nginx.
  - Se probó primero en el VPS propio de VeneTecnologías, con `zenit.com.ve` apuntando a él. Después se mueve al VPS que contrate el cliente: solo cambia el registro A del DNS.
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

## Captación (formulario por correo + WhatsApp)
- **Botón de WhatsApp:** CTA con mensaje precargado (por ejemplo, "Soy ferretero de [ciudad] y quiero distribuir Zenit"), usando `NEXT_PUBLIC_WHATSAPP_URL` (`https://wa.me/584244721107`). En las fichas, el mensaje incluye el producto y su código.
- **Formulario de contacto** en la sección de contacto: nombre, empresa, ciudad, teléfono, correo, producto de interés (opcional) y consentimiento. Envía un correo a `mercadeo@lefre.com.ve`. Se restaura desde el commit `9177559` y se cambia el destino: en lugar del webhook de n8n, envío por SMTP.
- **Servicio de envío:** contenedor Node pequeño `zenit-api`, aparte del contenedor nginx. Traefik lo enruta con `Host(zenit.com.ve) && PathPrefix(/api/)`. El sitio estático no cambia.
  - Variables de ejecución (no de build), solo en el `.env` del servidor: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `MAIL_TO=mercadeo@lefre.com.ve`.
  - **`MAIL_FROM` debe ser una dirección de un dominio con correo propio (por ejemplo, `lefre.com.ve`), no `@zenit.com.ve`**: ese dominio no tiene correo ni SPF/DKIM y los mensajes caerían en spam. Poner el correo del visitante en `Reply-To`.
  - Validación con Zod en servidor, honeypot, límite de intentos por IP, tamaño máximo del cuerpo, escape de todo el contenido del correo (sin HTML sin sanear) y errores genéricos hacia el cliente.
  - Si el envío falla, el formulario muestra un mensaje claro y ofrece el botón de WhatsApp como alternativa.
- Todo el código de captación vive aislado (`LeadCta` para WhatsApp y un componente `ContactForm`) para poder cambiar el destino más adelante (webhook de n8n, CRM) sin tocar el resto.

## Herramientas de verificación
- **Playwright** (MCP y pruebas en `tests/`): comprobar visualmente cada sección terminada en móvil y escritorio, y probar que el CTA de WhatsApp abre el enlace con el mensaje correcto.
- **Context7**: consultar la documentación actual de Next.js, Tailwind, shadcn/ui y Motion antes de usar APIs que no se recuerden con seguridad.
- **Strix**: auditoría de seguridad antes de entregar el sitio al cliente (cabeceras, dependencias, configuración de nginx y Traefik).
- **Lighthouse** móvil ≥ 90 en las cuatro categorías.

## Seguridad
- Secretos solo en variables de entorno; `.env` fuera de git y `.env.example` actualizado.
- **Indexación controlada:** `NEXT_PUBLIC_SITE_INDEXABLE`. En producción vale `true` (sitio indexable, `robots.txt` abierto con enlace al sitemap, `sitemap.xml` publicado). Si vale `false` (entornos de prueba), todas las páginas llevan `<meta name="robots" content="noindex, nofollow">`, `robots.txt` devuelve `Disallow: /` y no se publica el sitemap. El valor por defecto del código sigue siendo `false`, para que un entorno nuevo nunca se indexe por accidente. Al ser estático, es una variable de build: hay que reconstruir la imagen para cambiarla.
- Cabeceras de seguridad en la configuración de nginx (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` o CSP) y HTTPS forzado desde Traefik.
- Servicio `zenit-api`: credenciales SMTP solo en variables de entorno del servidor, nunca en el repositorio ni en el build; contenedor sin puertos publicados, ejecutado como usuario sin privilegios; nunca devolver detalles internos en los errores; no registrar en logs teléfonos ni correos.
- Datos personales: el formulario lleva casilla de consentimiento y no se guarda nada en el servidor; el único destino es el correo de mercadeo.

## No hacer
- No cambiar logo, colores ni tipografías de marca por gusto propio.
- No usar el lema "Impulsando el mañana con la energía de hoy" en el sitio: aparece en las fichas de las bombas, pero el lema oficial, confirmado por el cliente, es TECNOLOGÍA DE ALTURA.
- No agregar login, carrito, precios, blog ni filtros (fuera de alcance, ver el brief).
- No agregar más procesos de servidor ni integraciones (n8n, webhooks, bases de datos) fuera del servicio `zenit-api` del formulario de contacto en esta fase.
- No instalar dependencias pesadas para algo que se resuelve con CSS.

## Pendientes de marca
- Zenit no tiene aún cuenta propia de Instagram: se enlaza @lefrevzla.

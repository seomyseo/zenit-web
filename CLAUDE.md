# CLAUDE.md: zenit.com.ve

Sitio de marca de **Zenit**, marca propia de Inversiones Lefre (mayorista de ferretería en Venezuela). Qué se construye, rutas, datos de producto y criterios de aceptación: `BRIEF-ZENIT.md`. Este archivo fija stack, marca y reglas de trabajo.

- Textos de la web en español (Venezuela). Código, campos y rutas de datos en inglés.
- Mensajes de commit en español, formato convencional (`feat:`, `fix:`, `chore:`).

## Stack

- Next.js (App Router) + TypeScript estricto + Tailwind CSS + shadcn/ui + Motion.
- Zod para validar datos y formularios. **Sin base de datos por ahora**: los productos son archivos JSON y los leads salen por webhook (ver el brief). No agregar Postgres, ORM ni migraciones.
- Gestor de paquetes: el que ya use el repo; si es nuevo, pnpm.
- Despliegue: Docker + Traefik en VPS de Hostinger (`Dockerfile` y `docker-compose.yml` en la raíz).
- Páginas estáticas siempre que se pueda; servidor solo para `/api/leads`.

Scripts que debe tener `package.json`: `dev`, `build`, `start`, `lint`, `typecheck`, `test`. Antes de dar algo por terminado: `lint`, `typecheck` y `build` sin errores.

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
- Animación con Motion: sutil y con propósito (entradas de sección, hover). Respetar `prefers-reduced-motion`. No agregar GSAP ni Lenis sin una razón concreta.
- Componentes: partir de shadcn/ui; 21st.dev y el MCP de shadcn para generar piezas; ajustar siempre a los tokens de arriba.
- Imágenes con `next/image`, `alt` descriptivo y tamaños explícitos. Las imágenes de producto son las de `content/source/`.
- Accesibilidad: foco visible, navegación por teclado, jerarquía de encabezados correcta, contraste según la tabla de arriba.

## Datos y contenido
- Productos: `content/products/<slug>.json`, validados con Zod (esquema en el brief). **No inventar datos técnicos**: si no está en la ficha, la fila no existe.
- Los textos editables de la web viven en un solo archivo (`content/site.ts`), no dispersos en los componentes.
- **Sin precios en ningún lugar de la web.** Sin certificaciones ni sellos (Zenit no los tiene). La garantía es de **1 año en las bombas** (la que declara su empaque), directa por el distribuidor. No mencionar garantía en las fichas de refrigerantes, presostatos ni control hasta que el cliente la confirme para ellos.
- Lo que se omite o se corrige por ahora de las fichas se registra en `content/PENDIENTES.md`.

## Herramientas de verificación
- **Playwright** (MCP y pruebas en `tests/`): comprobar visualmente cada sección terminada en móvil y escritorio, y probar el flujo del formulario.
- **Context7**: consultar la documentación actual de Next.js, Tailwind, shadcn/ui y Motion antes de usar APIs que no se recuerden con seguridad.
- **Strix**: auditoría de seguridad antes de entregar (el sitio guarda datos de contacto).
- **Lighthouse** móvil ≥ 90 en las cuatro categorías.

## Seguridad
- Secretos solo en variables de entorno; `.env` fuera de git y `.env.example` actualizado.
- `/api/leads`: validar en servidor, honeypot, límite de intentos por IP, nunca devolver detalles internos en los errores.
- No registrar en logs teléfonos ni emails.

## No hacer
- No cambiar logo, colores ni tipografías de marca por gusto propio.
- No usar el lema "Impulsando el mañana con la energía de hoy" en el sitio: aparece en las fichas de las bombas, pero el lema oficial, confirmado por el cliente, es TECNOLOGÍA DE ALTURA.
- No agregar login, carrito, precios, blog ni filtros (fuera de alcance, ver el brief).
- No instalar dependencias pesadas para algo que se resuelve con CSS.

## Pendientes de marca
- Zenit no tiene aún cuenta propia de Instagram: se enlaza @lefrevzla.

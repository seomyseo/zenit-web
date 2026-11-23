# Brief para Claude Code: zenit.com.ve

> Complementa `CLAUDE.md` (stack, manual de marca, animación). Si algo choca con `CLAUDE.md`, prevalece `CLAUDE.md`.
> Contenido y decisiones de negocio: "Brief de contenido — Landing ZENIT" (Claude Docs).
> Idioma: textos de la web en español (Venezuela); código, campos y rutas de datos en inglés.

## 1. Qué se construye

Landing de marca de **Zenit**, marca propia de Inversiones Lefre (mayorista de ferretería en Venezuela, 80+ vendedores). Muestra los 11 productos actuales, una página por producto, y capta leads de ferreterías y distribuidores.

- **Público comercial:** solo ferreteros y distribuidores. El contenido es de consulta abierta para cualquiera.
- **No se vende aquí.** Sin precios, sin login, sin carrito. El pedido se canaliza después al portal B2B de lefre.com.ve (Fase 3).
- Debe verse como marca nacional seria, con identidad propia (manual de marca de Zenit), no como "una línea de Lefre".
- Lema oficial, confirmado por el cliente: **TECNOLOGÍA DE ALTURA** (ver `CLAUDE.md` para su tipografía y colores). Úsalo como tagline del hero o de la sección de marca. Las fichas de las bombas traen otro lema ("Impulsando el mañana con la energía de hoy"); no usarlo en la web.

### Fuera de alcance (no construir)
Precios, login, carrito, filtros, buscador, blog, multi-idioma, feed de Instagram.

## 2. Rutas

| Ruta | Contenido |
| --- | --- |
| `/` | Home: todas las secciones de la sección 4 |
| `/productos` | Catálogo completo (mismo componente de grilla que la home) |
| `/productos/[slug]` | Ficha de producto (11 páginas, generadas estáticamente) |
| `/api/leads` | POST del formulario de captación |
| `/sitemap.xml`, `/robots.txt` | SEO |

## 3. Decisiones de arquitectura

1. **Productos como archivos, no como base de datos.** `content/products/<slug>.json`, validados con Zod en el build. Son 11 productos y se añade quizás uno al año. El mismo esquema se mapea a una tabla de Postgres cuando llegue la Fase 3 (sync con el ERP Xenx).
2. **Sin base de datos por ahora.** Los leads se envían por webhook (sección 7). La base de datos llega con la Fase 3; el formato del lead ya está pensado para pasar luego a una tabla compartida con lefre.com.ve.
3. **Despliegue:** Docker + Traefik en el VPS de Hostinger, como el resto del proyecto.

## 4. Secciones de la home (en este orden)

1. **Header:** logo Zenit; menú Inicio · Productos · Por qué Zenit · Dónde comprar · Contacto; CTA **"Quiero distribuir Zenit"**; enlace discreto "Distribuido por Inversiones Lefre" → lefre.com.ve.
2. **Hero:** headline provisional *"Bombas de agua y refrigerantes Zenit, con respaldo nacional"* (el cliente puede cambiarlo); imagen de un producto estrella; CTA primario "Ver productos" (ancla al catálogo), secundario "Quiero distribuir Zenit" (ancla al formulario).
3. **Por qué Zenit:** 4 puntos con ícono: marca creada por Inversiones Lefre; disponible en todo el país con más de 80 vendedores en calle; fichas técnicas claras para cada producto; garantía de 1 año en las bombas, a través del distribuidor. **No afirmar** "mejor precio/calidad": no está confirmado.
4. **Catálogo:** una sola página, dos grupos con título: **Agrícola (9)** y **Automotriz (2)** (los mismos grupos del ERP). Sin filtros ni buscador. Tarjeta: imagen, nombre, una línea descriptiva, botón "Ver ficha". Cierre con banda: "¿Eres ferretero? Pide Zenit a tu vendedor o regístrate".
5. **Calidad y respaldo:** garantía de 1 año en las bombas (la que declara su empaque), directa por el distribuidor, y el respaldo de Inversiones Lefre. **Zenit no tiene certificaciones: no mostrar sellos ni normas.**
6. **Dónde comprar:** 3 pasos: (1) pídelo a tu vendedor Lefre en la próxima visita; (2) si aún no eres cliente, regístrate como ferretería o distribuidor; (3) próximamente, haz tu pedido en el portal de lefre.com.ve. Mensaje de cobertura nacional y enlace a lefre.com.ve.
7. **Captación:** formulario (sección 7).
8. **Footer:** logo Zenit y "Marca de Inversiones Lefre"; enlaces Productos · Dónde comprar · Contacto · lefre.com.ve; datos de contacto; Instagram **@lefrevzla** (compartido con Lefre por ahora).

Los textos exactos son borradores en español; déjalos fáciles de editar (un archivo `content/site.ts` o similar).

## 5. Datos de producto

```ts
type Product = {
  erpCode: string;            // "0021-0318": llave futura con Xenx
  slug: string;
  model?: string;             // "ZBC-002S": código comercial de la ficha, si existe
  name: string;
  group: "agricola" | "automotriz";
  family: "centrifuga" | "periferica" | "sumergible" | "presostato" | "control" | "refrigerante";
  variantOf?: string;         // erpCode de la familia; solo para agrupar y "relacionados"
  shortDescription: string;
  features?: string[];
  applications?: string[];
  includes?: string[];        // p. ej. "2 paneles solares de 590 W"
  warranty?: string;          // solo bombas: "1 año, directa por el distribuidor"
  specGroups?: { title: string; rows: { label: string; value: string }[] }[];
  images: { src: string; alt: string }[];
  files?: { kind: "datasheet" | "curve" | "wiring"; src: string; label: string }[];
  status: "published" | "draft";
};
```

### Los 11 productos (códigos del ERP)

| erpCode | Producto | slug (`content/products/<slug>.json`) | Modelo | Familia | Fuente de datos |
| --- | --- | --- | --- | --- | --- |
| 0021-0318 | Bomba centrífuga solar cobre 1 HP, 2 paneles | bomba-centrifuga-solar-cobre-1hp | ZBC-002S | centrifuga | Ficha |
| 0021-0314 | Bomba centrífuga cobre 1 HP, 110-220 V | bomba-centrifuga-cobre-1hp | ZBC-002C | centrifuga | Nombre + empaque |
| 0021-0316 | Bomba periférica solar cobre 1/2 HP, 1 panel | bomba-periferica-solar-cobre-1-2hp | ZBP-001S | periferica | Ficha |
| 0021-0310 | Bomba periférica aleación 1/2 HP, 110-220 V | bomba-periferica-aleacion-1-2hp | ZBP-001A | periferica | Nombre + empaque |
| 0021-0312 | Bomba periférica cobre 1/2 HP, 110-220 V | bomba-periferica-cobre-1-2hp | ZBP-001C | periferica | Nombre + empaque |
| 0021-0320 | Bomba sumergible solar cobre 1/2 HP, 2 paneles | bomba-sumergible-solar-cobre-1-2hp | ZBS-001S | sumergible | Ficha |
| 0021-0332 | Presostato hidroneumático 20-40 PSI, hembra | presostato-hidroneumatico-hembra | — | presostato | Nombre + empaque |
| 0021-0331 | Presostato hidroneumático 20-40 PSI, macho | presostato-hidroneumatico-macho | — | presostato | Nombre + empaque |
| 0021-0330 | Press control automático para bombas 110/120 V | control-automatico-presion-bombas | — | control | Nombre + empaque |
| 2352-0124 | Refrigerante rojo listo para usar, galón | refrigerante-rojo-galon | — | refrigerante | Ficha |
| 2352-0125 | Refrigerante verde listo para usar, galón | refrigerante-verde-galon | — | refrigerante | Ficha |

Los modelos ZBC-002C, ZBP-001A y ZBP-001C están impresos en sus empaques. Los presostatos y el control no llevan modelo: el empaque dice "ZPH-000X", "ZPM-000X" y "ZPC-000X", que parecen marcadores.

Grupos del ERP: los 9 primeros son **Agrícola** (grupo 70); los 2 refrigerantes, **Automotriz** (grupo 80).

### Cómo cargar los datos
- Las fuentes están en `content/source/`. **Extrae los datos de ahí; no inventes valores.** Si un dato no existe, se omite la fila (nada de "N/A"). Prioridad: ficha técnica > nombre del ERP > empaque.
- `content/source/` **nunca se sirve** ni entra a la imagen Docker (`.dockerignore`). Las imágenes publicables se generan en `public/products/` con `pnpm assets:products` (copia las fotos y recorta curva y diagramas de los PDF con poppler).
- **Validación:** `pnpm validate:content` (también corre en `prebuild`) valida con Zod. Comprueba que `slug` y `erpCode` sean únicos, que `variantOf` exista, que el archivo se llame `<slug>.json` y que cada imagen exista en `public/`.
- **Bombas solares (3 fichas):** bloques `Datos de la bomba`, `Datos del motor`, `Panel solar` (especificaciones técnicas y físicas) y `includes`. Las "Características" y "Aplicaciones" de la ficha pasan a `features` y `applications`, como texto en la página. Se publican como imagen la curva y el diagrama de conexión de la ZBS-001S y el diagrama de conexión de la ZBC-002S. El diagrama de la ZBP-001S no se publica (dice DC72V).
- **Refrigerantes (2 fichas):** bloques `Envase y embalaje` (presentación, almacenaje, caducidad) y `Especificaciones` (color, pH, composición). Beneficios con ícono: no corroe, no genera sólidos, no necesita aditivos. Indicar "listo para usar, no agregar agua". El color (rojo o verde) acompaña al producto.
- **Bombas eléctricas (3) y presostatos o control (3):** no tienen ficha, pero sus **empaques** traen especificaciones. Se publican los datos del nombre más **solo los del empaque que concuerdan entre sí y con el nombre**; lo que choca se omite. Todo dato que sale solo del empaque está marcado en `content/PENDIENTES.md` como **"validar con el cliente antes de producción"**. **No heredar bloques solares** (panel, motor solar, "sitios remotos sin electricidad") ni sus imágenes. `variantOf` solo sirve para agrupar y mostrar "relacionados".
- **Ficha técnica en PDF:** ningún producto la ofrece por ahora (`files` sin `datasheet`). Los PDF actuales traen el lema que no se usa, curvas erróneas y DC72V en la ZBP-001S. Se agrega cuando llegue la versión corregida.
- **Garantía (`warranty`):** "1 año, directa por el distribuidor", solo en las 6 bombas (la que declaran sus empaques). Presostatos, control y refrigerantes van sin garantía hasta que el cliente la confirme.
- Formato es-VE en los valores: coma decimal (43,58 V; pH 8,81) y punto de miles (3.785 ml).
- Cada producto debe poder pasar a `draft` para ocultarlo sin borrar el archivo.

### Correcciones conocidas (aplicar así por ahora)
Las fichas tienen inconsistencias que el cliente aún no confirma. Para no frenar el desarrollo:
- **ZBC-002S y ZBP-001S:** no publicar la curva de rendimiento (no coincide con los datos declarados).
- **ZBP-001S:** el voltaje del motor es **DC48V** (una página de la ficha dice DC72V por error). En "Tipo de bomba" usar "Periférica superficial solar" (la ficha dice "Centrífuga").
- **Refrigerantes:** no publicar "Concentración de refrigerante", "Conductividad" ni "Cambio o sustitución" hasta que se confirmen.
- Corregir ortografía al transcribir ("anodizado", tildes en títulos).
- **Centrífuga eléctrica (0021-0314):** sin altura ni caudal (su empaque dice 45 m / 42 L/min y también 30 m / 100 L/min).
- **Control de presión (0021-0330):** voltaje 110/120 V según el nombre del ERP (el empaque dice 110-220 V).
- **Presostatos:** no se publica la tabla "Características eléctricas" del empaque (ambigua).
- **Empaques solares:** traen datos de la versión eléctrica (110/220 V, 750 W, 95 m, "72 Hz"); no se usan, mandan las fichas.
- Registrar todo lo anterior en `content/PENDIENTES.md` para reponerlo cuando llegue la ficha corregida.

## 6. Página de producto (`/productos/[slug]`)

Una plantilla única alimentada por datos, para que agregar el producto 12 sea crear un JSON:

1. Cabecera: nombre, modelo y código si existen, grupo.
2. Galería de imágenes.
3. Descripción corta, características y aplicaciones (solo las que existan).
4. "Incluye" (kits solares).
5. Tablas de especificaciones por bloque (`specGroups`), en texto indexable.
6. Botón **"Descargar ficha técnica (PDF)"** solo si hay archivo; curva y diagrama de conexión como imágenes si existen.
7. CTA **"Quiero distribuir Zenit"** → formulario con este producto preseleccionado.
8. Hasta 3 productos relacionados de la misma familia o grupo.

Sin precios en ningún lugar.

## 7. Captación de leads

- **Campos:** nombre, empresa, ciudad, teléfono, email, productos de interés (selector múltiple con los 11) y una línea de consentimiento ("Al enviar, aceptas que Inversiones Lefre te contacte").
- **Formato del lead** (sin base de datos por ahora): `created_at`, `origin` (valor `zenit.com.ve`), `name`, `company`, `city`, `phone`, `email`, `product_interest` (lista de `erpCode`), `consent` (bool). Son los mismos campos que tendrá la tabla compartida con lefre.com.ve.
- **`POST /api/leads`:** validación con Zod en servidor, honeypot, límite de intentos por IP, respuesta clara de éxito o error. No guarda nada en el servidor.
- **Envío:** POST a `LEADS_WEBHOOK_URL` (será un flujo de n8n que decide dónde guardarlo). Si el webhook no está configurado o falla, responder con error claro y mostrar el botón de WhatsApp como alternativa; nunca perder el lead en silencio. En desarrollo sin webhook, aceptar el envío y avisar por consola sin imprimir datos personales.
- **WhatsApp:** botón si existe `NEXT_PUBLIC_WHATSAPP_URL` (el número está pendiente).
- Variables de entorno documentadas en `.env.example`.

## 8. SEO

- `lang="es-VE"`. Title y descripción únicos por página. Title de la home sugerido: *"Zenit | Bombas de agua y refrigerantes para ferreterías en Venezuela"*.
- Metadata Open Graph con la imagen del producto o de la marca.
- JSON-LD: `Organization` (Inversiones Lefre, marca Zenit) y `Product` en cada ficha (name, description, image, sku = `erpCode`, brand). **Sin `offers` ni precio.**
- `sitemap.xml` con home, `/productos` y los 11 productos publicados; `robots.txt`.
- Alt descriptivo en cada imagen; datos técnicos como texto, no solo dentro del PDF.

## 9. Criterios de aceptación

- Responsive de 360 px a escritorio; navegación y formulario usables con teclado.
- Lighthouse móvil ≥ 90 en rendimiento, accesibilidad, buenas prácticas y SEO.
- Pruebas con Playwright: la home carga; el catálogo muestra 11 productos en 2 grupos; las 11 fichas responden 200; el formulario envía el lead al webhook (simulado en las pruebas) y muestra el éxito; el sitemap tiene todas las URLs.
- Sin errores en consola. Imágenes optimizadas con `next/image`.
- Auditoría de seguridad con Strix antes de entregar (el sitio recibe datos de contacto).
- Fiel al manual de marca de Zenit (ver `CLAUDE.md`).

## 10. Orden de trabajo sugerido

1. Configuración del proyecto y variables de entorno.
2. Esquema Zod, los 11 JSON de producto y `content/PENDIENTES.md`, extrayendo datos de `content/source/`.
3. Design tokens y componentes base desde el manual de marca.
4. Home: secciones 1 a 6 y footer.
5. Página de producto y `/productos`.
6. Formulario y `/api/leads` con envío por webhook.
7. SEO: metadata, JSON-LD, sitemap, robots.
8. Pruebas (Playwright), Lighthouse, Strix, Dockerfile y despliegue con Traefik.

## 11. Pendientes que no bloquean

- Fichas corregidas (ver sección 5) y fichas o datos de los 6 productos sin ficha.
- Originales de imágenes en alta resolución de los 11 productos.
- Número de WhatsApp comercial y datos de contacto del footer.
- URL del webhook de n8n que recibirá los leads (hasta entonces el formulario queda con el aviso de desarrollo).
- Cuenta de Instagram propia de Zenit (hoy se comparte @lefrevzla).
- Productos nuevos previstos a mediano plazo (~1 año): ya soportado por la plantilla por datos.

# syntax=docker/dockerfile:1
#
# Dos imágenes desde el mismo Dockerfile (docker-compose.yml elige con "target"):
#   web → nginx sirviendo la exportación estática (out/)
#   api → zenit-api, Node mínimo que envía el formulario de contacto por SMTP

# ── Dependencias (compartidas por ambos builds) ───────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# pnpm en la versión fijada en package.json ("packageManager").
RUN corepack enable

# Capa cacheable mientras no cambie el lockfile.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ── Build del sitio estático ──────────────────────────────────────────────────────
FROM deps AS build-web

# Variables de BUILD: se incrustan en el HTML/JS al compilar (vienen de .env vía compose).
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_WHATSAPP_URL
ARG NEXT_PUBLIC_SITE_INDEXABLE
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_WHATSAPP_URL=$NEXT_PUBLIC_WHATSAPP_URL \
    NEXT_PUBLIC_SITE_INDEXABLE=$NEXT_PUBLIC_SITE_INDEXABLE

# prebuild valida los productos; postbuild comprueba out/ y, si el sitio no es
# indexable, quita el sitemap.
COPY . .
RUN pnpm build

# ── Build de zenit-api: un solo archivo con sus dependencias (esbuild) ────────────
FROM deps AS build-api
COPY . .
RUN pnpm build:api

# ── Imagen: zenit-api ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS api
ENV NODE_ENV=production \
    PORT=3001
WORKDIR /app
# Solo el bundle: sin node_modules, sin código fuente, sin herramientas de build.
COPY --from=build-api /app/services/zenit-api/dist/server.cjs ./server.cjs
# Usuario sin privilegios (viene en la imagen oficial de Node).
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3001/api/health || exit 1
CMD ["node", "server.cjs"]

# ── Imagen: sitio (nginx) ─────────────────────────────────────────────────────────
FROM nginx:alpine AS web

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build-web /app/out /usr/share/nginx/html

# Solo para la red interna de Docker: Traefik llega por la red "traefik".
EXPOSE 80

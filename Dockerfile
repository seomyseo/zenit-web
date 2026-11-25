# syntax=docker/dockerfile:1

# ── 1. Build: exportación estática de Next.js (out/) ──────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# pnpm en la versión fijada en package.json ("packageManager").
RUN corepack enable

# Variables de BUILD: se incrustan en el HTML/JS al compilar (vienen de .env vía compose).
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_WHATSAPP_URL
ARG NEXT_PUBLIC_SITE_INDEXABLE
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_WHATSAPP_URL=$NEXT_PUBLIC_WHATSAPP_URL \
    NEXT_PUBLIC_SITE_INDEXABLE=$NEXT_PUBLIC_SITE_INDEXABLE

# Dependencias primero (capa cacheable mientras no cambie el lockfile).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Código y build. prebuild valida los productos; postbuild comprueba out/ y, si el
# sitio no es indexable, quita el sitemap.
COPY . .
RUN pnpm build

# ── 2. Runtime: nginx sirviendo out/ ──────────────────────────────────────────────
FROM nginx:alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/out /usr/share/nginx/html

# Solo para la red interna de Docker: Traefik llega por la red "traefik".
EXPOSE 80

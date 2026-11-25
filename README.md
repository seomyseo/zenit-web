# zenit.com.ve

Sitio de marca de **Zenit** (marca de Inversiones Lefre). Dos contenedores detrás del **Traefik** del VPS:

- **`zenit-web`**: Next.js exportado como sitio **estático** (`out/`), servido con **nginx**.
- **`zenit-api`**: servicio Node mínimo con una sola función. Recibe el formulario de contacto (`POST /api/contact`) y lo envía por correo (SMTP) a `mercadeo@lefre.com.ve`. No guarda nada.

Además del formulario, el contacto tiene un botón de WhatsApp con mensaje precargado ([`components/leads/lead-cta.tsx`](components/leads/lead-cta.tsx)). Sin base de datos.

- Reglas del proyecto: [`CLAUDE.md`](CLAUDE.md). Contenido y alcance: [`BRIEF-ZENIT.md`](BRIEF-ZENIT.md).
- Pendientes de datos: [`content/PENDIENTES.md`](content/PENDIENTES.md). Pendientes de diseño: [`content/DISENO-PENDIENTE.md`](content/DISENO-PENDIENTE.md).

## Desarrollo local

Requisitos: Node 22 y pnpm (`corepack enable`).

```bash
pnpm install
pnpm dev            # http://localhost:3000 (el formulario no tiene /api/ aquí: muestra el error y WhatsApp)
pnpm build          # genera out/ (valida productos antes y comprueba out/ después)
pnpm start          # sirve out/ con las mismas reglas que nginx
pnpm lint && pnpm typecheck && pnpm test
```

Las pruebas (`pnpm test`, requieren `pnpm build` antes) levantan solas un SMTP simulado ([`tests/mock-smtp.mjs`](tests/mock-smtp.mjs)), el bundle real de `zenit-api` y el sitio estático, con `/api/` reenviado como lo hace Traefik.

Para probar el formulario a mano con un SMTP real o simulado:

```bash
node tests/mock-smtp.mjs                                  # SMTP en :2525, mensajes en http://localhost:2526/messages
SMTP_HOST=127.0.0.1 SMTP_PORT=2525 MAIL_FROM="Sitio Zenit <web@lefre.com.ve>" pnpm dev:api   # :3001
pnpm start --api http://localhost:3001                    # sitio en :3000 con /api/ → zenit-api
```

### Código del formulario

| Pieza | Dónde |
| --- | --- |
| Formulario (navegador) | [`components/leads/contact-form.tsx`](components/leads/contact-form.tsx) |
| Campos, mensajes y esquema Zod (compartidos) | [`lib/contact/`](lib/contact/) y `site.leadForm` en [`content/site.ts`](content/site.ts) |
| Servicio | [`services/zenit-api/src/`](services/zenit-api/src/): `app.ts` (HTTP, validación, honeypot, límite, tamaño), `email.ts` (correo escapado), `main.ts` (variables y SMTP) |
| Bundle | `pnpm build:api` → `services/zenit-api/dist/server.cjs` (un solo archivo, sin `node_modules`) |

Para cambiar el destino más adelante (webhook de n8n, CRM) se cambia `main.ts` (la función `send`) sin tocar el sitio.

### Íconos

`pnpm assets:icons` genera `favicon.ico` (16/32/48), `icon.svg`, `apple-touch-icon.png`, `icon-192/512.png` y `manifest.webmanifest` en `public/`. Usa el águila del logo oficial (`public/brand/zenit-color.svg`), recortada a la cabeza y las franjas del ala, sin redibujar nada.

---

## Despliegue en el VPS

### Cómo está montado

| Pieza | Valor |
| --- | --- |
| Ruta en el VPS | `/opt/zenit` |
| Contenedores | `zenit-web` (nginx:alpine, puerto 80 interno) y `zenit-api` (Node 22, puerto 3001 interno). **Ninguno publica puertos.** |
| Red Docker | `traefik` (externa, la del Traefik existente) |
| Router `zenit` | `Host(zenit.com.ve) \|\| Host(www.zenit.com.ve)` → `zenit-web`. Entrypoint `websecure`, certresolver `myresolver` (TLS-ALPN) |
| Router `zenit-api` | `Host(zenit.com.ve) && PathPrefix(/api/)` → `zenit-api`, con `priority=100` para ganarle al router `zenit` |
| Dominio | `zenit.com.ve`; `www.zenit.com.ve` redirige 301 al dominio sin www |
| Reinicio | `restart: unless-stopped` (ambos) |

No se crea otro Traefik: este proyecto solo añade dos contenedores con etiquetas para el Traefik que ya corre. HTTP → HTTPS lo redirige Traefik.

`zenit-api` corre como usuario `node` (sin privilegios), con sistema de archivos de solo lectura, sin capacidades de Linux (`cap_drop: ALL`), `no-new-privileges` y 128 MB de memoria. La imagen solo contiene Node y un archivo (`server.cjs`).

> **Cloudflare:** el certificado se valida por TLS-ALPN, así que los registros `zenit.com.ve` y `www.zenit.com.ve` deben estar en **DNS only** (nube gris), **nunca con proxy** (nube naranja).

### Variables (`/opt/zenit/.env`, no va a git)

**Sitio (`zenit-web`), de build:** si se cambian, hay que reconstruir (`docker compose up -d --build`).

| Variable | Producción | Para qué |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://zenit.com.ve` | URL canónica, sitemap, Open Graph. Obligatoria. |
| `NEXT_PUBLIC_WHATSAPP_URL` | `https://wa.me/584244721107` | Botón de WhatsApp. Formato `https://wa.me/58XXXXXXXXXX`. Vacía: usa el número oficial fijado en `lib/env.ts`. |
| `NEXT_PUBLIC_SITE_INDEXABLE` | `true` | `true`: indexable, `robots.txt` abierto con `Sitemap`, `sitemap.xml` publicado. Vacía o `false` (entornos de prueba): `noindex` en todas las páginas, `robots.txt` con `Disallow: /` y sin sitemap. |

**Formulario (`zenit-api`), de ejecución:** no entran en ninguna imagen. Tras cambiarlas basta `docker compose up -d zenit-api`.

| Variable | Ejemplo | Para qué |
| --- | --- | --- |
| `SMTP_HOST` | `smtp.servidor-de-lefre.com` | Servidor SMTP. Obligatoria. |
| `SMTP_PORT` | `587` | 587 (STARTTLS, obligatorio si hay usuario) o 465 (TLS directo). |
| `SMTP_USER` / `SMTP_PASS` | — | Credenciales. Van juntas. Si la clave tiene `$`, entre comillas simples: `SMTP_PASS='abc$123'`. |
| `MAIL_FROM` | `"Sitio Zenit <usuario@lefre.com.ve>"` | Remitente. **Debe ser de un dominio con correo propio (@lefre.com.ve), nunca @zenit.com.ve**: ese dominio no tiene correo ni SPF/DKIM y caería en spam. Obligatoria. |
| `MAIL_TO` | `mercadeo@lefre.com.ve` | Destino de los formularios. |

El correo del visitante va en `Reply-To`: "Responder" desde el buzón de mercadeo le escribe a él. Si falta `SMTP_HOST` o `MAIL_FROM`, `zenit-api` se detiene con un mensaje claro en `docker compose logs zenit-api`. El resto del sitio sigue funcionando y el formulario ofrece WhatsApp.

### ⚠️ Antes del primer despliegue: bajar la página provisional

Hoy hay una página provisional en `/opt/zenit-test` (contenedor `zenit-test`) con **el mismo dominio y el mismo router `zenit`**. Si las dos están arriba, Traefik tiene dos definiciones del router `zenit` y el sitio falla. **Bajarla primero:**

```bash
cd /opt/zenit-test
docker compose down
```

### Primer despliegue

```bash
# 1. Clonar
sudo mkdir -p /opt/zenit && sudo chown "$USER" /opt/zenit
git clone <URL-DEL-REPOSITORIO> /opt/zenit
cd /opt/zenit

# 2. Variables (valores de producción: ver las tablas de arriba)
cp .env.example .env
chmod 600 .env
nano .env

# 3. Comprobar que existe la red del Traefik
docker network ls | grep traefik

# 4. Bajar la página provisional (ver arriba) y levantar
(cd /opt/zenit-test && docker compose down)
docker compose up -d --build

# 5. Verificar
docker compose ps                                   # zenit-api debe quedar "healthy"
docker compose logs --tail=50 zenit-web zenit-api   # zenit-api: "Conexión SMTP verificada"
curl -sI https://zenit.com.ve | head -n 5           # 200 y cabeceras de seguridad
curl -sI https://www.zenit.com.ve | head -n 5       # 301 → https://zenit.com.ve/
curl -s  https://zenit.com.ve/robots.txt            # producción: Allow y Sitemap
curl -sI https://zenit.com.ve/sitemap.xml           # producción: 200
curl -s  https://zenit.com.ve/api/health            # {"ok":true,"status":"up"}
```

Después, enviar el formulario una vez desde el sitio y confirmar que el correo llega a `mercadeo@lefre.com.ve` (revisar también la carpeta de spam la primera vez).

El primer certificado puede tardar unos segundos; si da error de TLS, revisar los logs del Traefik (`docker logs <contenedor-traefik> --tail=100`) y que el DNS no tenga proxy de Cloudflare.

### Actualizar

```bash
cd /opt/zenit
git pull && docker compose up -d --build
```

El build ocurre dentro de Docker (Node 22 + pnpm, una etapa de dependencias compartida por las dos imágenes). Las imágenes finales solo contienen nginx con `out/` y Node con `server.cjs`. Las imágenes viejas se pueden limpiar con `docker image prune -f`.

### Entorno de prueba (sin indexar)

En un VPS o dominio de prueba, dejar `NEXT_PUBLIC_SITE_INDEXABLE` vacía o en `false` y reconstruir: todas las páginas llevan `noindex`, `robots.txt` bloquea todo y no hay sitemap. El valor por defecto del código es `false`, para que un entorno nuevo nunca se indexe por accidente.

### Opcional: proteger con usuario y contraseña (Traefik basicAuth)

Mientras el sitio no esté aprobado se puede pedir clave:

1. Generar el usuario (requiere `apache2-utils`): `htpasswd -nbB revisor 'CLAVE-SEGURA'`
2. Añadir a `.env`, **duplicando cada `$` como `$$`**: `ZENIT_BASIC_AUTH_USERS=revisor:$$2y$$05$$...`
3. En `docker-compose.yml`, sustituir la línea `traefik.http.routers.zenit.middlewares=zenit-www-redirect` por las dos líneas comentadas de `zenit-auth`.
4. `docker compose up -d` (no hace falta `--build`: las etiquetas no son de build).

Para quitarla, revertir el paso 3 y volver a levantar. La protección cubre el router `zenit`; `/api/contact` no la necesita (solo acepta el formulario).

---

## Cómo mover el sitio a otro VPS

El sitio no guarda datos: mover es reconstruir en el VPS nuevo y cambiar el DNS.

1. **Anotar el DNS actual.** En Cloudflare, copiar los registros de `zenit.com.ve` (el dominio está en nic.ve y no tiene correo: no hay registros MX que preservar).

2. **Instalar Docker** en el VPS nuevo (Ubuntu/Debian):
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker "$USER"   # cerrar sesión y volver a entrar
   ```

3. **Instalar Traefik** (si el VPS no lo tiene). Debe ofrecer lo que este proyecto espera: red externa `traefik`, entrypoint `websecure` (443), redirección de `web` (80) a HTTPS y un certresolver `myresolver` con TLS-ALPN. Ejemplo mínimo en `/opt/traefik/docker-compose.yml`:
   ```yaml
   services:
     traefik:
       image: traefik:v3
       container_name: traefik
       restart: unless-stopped
       command:
         - --providers.docker=true
         - --providers.docker.exposedbydefault=false
         - --entrypoints.web.address=:80
         - --entrypoints.web.http.redirections.entrypoint.to=websecure
         - --entrypoints.web.http.redirections.entrypoint.scheme=https
         - --entrypoints.websecure.address=:443
         - --certificatesresolvers.myresolver.acme.tlschallenge=true
         - --certificatesresolvers.myresolver.acme.email=CORREO-DEL-RESPONSABLE
         - --certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - /var/run/docker.sock:/var/run/docker.sock:ro
         - ./letsencrypt:/letsencrypt
       networks:
         - traefik
   networks:
     traefik:
       name: traefik
   ```
   ```bash
   cd /opt/traefik && docker compose up -d
   ```
   Abrir los puertos 80 y 443 en el firewall del VPS.

4. **Clonar y configurar:**
   ```bash
   sudo mkdir -p /opt/zenit && sudo chown "$USER" /opt/zenit
   git clone <URL-DEL-REPOSITORIO> /opt/zenit
   cd /opt/zenit
   cp .env.example .env && chmod 600 .env && nano .env    # mismos valores que en el VPS anterior (incluido SMTP)
   ```

5. **Levantar:**
   ```bash
   docker compose up -d --build
   ```
   Se puede comprobar antes de cambiar el DNS forzando la resolución:
   `curl -sI --resolve zenit.com.ve:443:IP-NUEVA https://zenit.com.ve` (el certificado aún no existirá hasta el paso 6; esto solo confirma que responde). `docker compose logs zenit-api` debe mostrar "Conexión SMTP verificada" (el SMTP de Lefre puede requerir autorizar la IP nueva).

6. **Cambiar el registro A en Cloudflare** de `zenit.com.ve` (y `www`) a la IP del VPS nuevo, en **DNS only** (sin proxy). Con TTL bajo, el cambio se propaga en minutos; Traefik emite el certificado en la primera visita.

7. **Verificar** (como en "Primer despliegue", paso 5, y un envío real del formulario) y **apagar el sitio en el VPS anterior**:
   ```bash
   cd /opt/zenit && docker compose down
   ```

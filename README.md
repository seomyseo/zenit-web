# zenit.com.ve

Sitio de marca de **Zenit** (marca de Inversiones Lefre). Next.js exportado como sitio **100 % estático** (`out/`), servido con **nginx** detrás del **Traefik** del VPS. Sin base de datos, sin API y sin formularios: el contacto es un botón de WhatsApp con mensaje precargado (`components/leads/lead-cta.tsx`).

- Reglas del proyecto: [`CLAUDE.md`](CLAUDE.md). Contenido y alcance: [`BRIEF-ZENIT.md`](BRIEF-ZENIT.md).
- Pendientes de datos: [`content/PENDIENTES.md`](content/PENDIENTES.md). Pendientes de diseño: [`content/DISENO-PENDIENTE.md`](content/DISENO-PENDIENTE.md).

## Desarrollo local

Requisitos: Node 22 y pnpm (`corepack enable`).

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm build          # genera out/ (valida productos antes y comprueba out/ después)
pnpm start          # sirve out/ con las mismas reglas que nginx
pnpm lint && pnpm typecheck && pnpm test
```

Las variables (`.env.example`) son **de build**: se incrustan al compilar. Para probar un build local con valores, exportarlas antes de `pnpm build`.

---

## Despliegue en el VPS

### Cómo está montado

| Pieza | Valor |
| --- | --- |
| Ruta en el VPS | `/opt/zenit` |
| Contenedor | `zenit-web` (nginx:alpine, puerto 80 interno, **sin puertos publicados**) |
| Red Docker | `traefik` (externa, la del Traefik existente) |
| Router de Traefik | `zenit`, entrypoint `websecure`, certresolver `myresolver` (TLS-ALPN) |
| Dominio | `zenit.com.ve`; `www.zenit.com.ve` redirige 301 al dominio sin www |
| Reinicio | `restart: unless-stopped` |

No se crea otro Traefik: este proyecto solo añade un contenedor con etiquetas para el Traefik que ya corre. HTTP → HTTPS lo redirige Traefik.

> **Cloudflare:** el certificado se valida por TLS-ALPN, así que los registros `zenit.com.ve` y `www.zenit.com.ve` deben estar en **DNS only** (nube gris), **nunca con proxy** (nube naranja).

### Variables (`/opt/zenit/.env`, no va a git)

Son de **build**: si se cambian, hay que reconstruir (`docker compose up -d --build`).

| Variable | Ejemplo | Para qué |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://zenit.com.ve` | URL canónica, sitemap, Open Graph. Obligatoria. |
| `NEXT_PUBLIC_WHATSAPP_URL` | `https://wa.me/58XXXXXXXXXX` | Botón de contacto. Vacía: el botón lleva a Instagram @lefrevzla. |
| `NEXT_PUBLIC_SITE_INDEXABLE` | `false` | Solo `true` permite indexar. Con cualquier otro valor: `noindex` en todas las páginas, `robots.txt` con `Disallow: /` y sin `sitemap.xml`. Poner `true` solo al lanzar. |

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

# 2. Variables
cp .env.example .env
nano .env        # completar NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_WHATSAPP_URL, NEXT_PUBLIC_SITE_INDEXABLE

# 3. Comprobar que existe la red del Traefik
docker network ls | grep traefik

# 4. Bajar la página provisional (ver arriba) y levantar
(cd /opt/zenit-test && docker compose down)
docker compose up -d --build

# 5. Verificar
docker compose ps
docker compose logs --tail=50 zenit-web
curl -sI https://zenit.com.ve | head -n 5          # 200 y cabeceras de seguridad
curl -sI https://www.zenit.com.ve | head -n 5      # 301 → https://zenit.com.ve/
curl -s https://zenit.com.ve/robots.txt
```

El primer certificado puede tardar unos segundos; si da error de TLS, revisar los logs del Traefik (`docker logs <contenedor-traefik> --tail=100`) y que el DNS no tenga proxy de Cloudflare.

### Actualizar

```bash
cd /opt/zenit
git pull && docker compose up -d --build
```

El build ocurre dentro de Docker (Node 22 + pnpm) y la imagen final solo contiene nginx y `out/`. Las imágenes viejas se pueden limpiar con `docker image prune -f`.

### Lanzamiento (abrir a buscadores)

```bash
cd /opt/zenit
sed -i 's/^NEXT_PUBLIC_SITE_INDEXABLE=.*/NEXT_PUBLIC_SITE_INDEXABLE=true/' .env
docker compose up -d --build
curl -s https://zenit.com.ve/robots.txt       # debe mostrar Allow y Sitemap
curl -sI https://zenit.com.ve/sitemap.xml     # 200
```

### Opcional: proteger con usuario y contraseña (Traefik basicAuth)

Mientras el sitio no esté aprobado se puede pedir clave:

1. Generar el usuario (requiere `apache2-utils`): `htpasswd -nbB revisor 'CLAVE-SEGURA'`
2. Añadir a `.env`, **duplicando cada `$` como `$$`**: `ZENIT_BASIC_AUTH_USERS=revisor:$$2y$$05$$...`
3. En `docker-compose.yml`, sustituir la línea `traefik.http.routers.zenit.middlewares=zenit-www-redirect` por las dos líneas comentadas de `zenit-auth`.
4. `docker compose up -d` (no hace falta `--build`: las etiquetas no son de build).

Para quitarla, revertir el paso 3 y volver a levantar.

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
   cp .env.example .env && nano .env    # mismos valores que en el VPS anterior
   ```

5. **Levantar:**
   ```bash
   docker compose up -d --build
   ```
   Se puede comprobar antes de cambiar el DNS forzando la resolución:
   `curl -sI --resolve zenit.com.ve:443:IP-NUEVA https://zenit.com.ve` (el certificado aún no existirá hasta el paso 6; esto solo confirma que responde).

6. **Cambiar el registro A en Cloudflare** de `zenit.com.ve` (y `www`) a la IP del VPS nuevo, en **DNS only** (sin proxy). Con TTL bajo, el cambio se propaga en minutos; Traefik emite el certificado en la primera visita.

7. **Verificar** (como en "Primer despliegue", paso 5) y **apagar el sitio en el VPS anterior**:
   ```bash
   cd /opt/zenit && docker compose down
   ```

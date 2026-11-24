/**
 * Límite de intentos por IP en memoria (ventana deslizante). Suficiente para un
 * solo contenedor; si el sitio escala a varias réplicas, mover a Redis o al proxy.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = Number(process.env.LEADS_RATE_LIMIT_MAX) > 0 ? Number(process.env.LEADS_RATE_LIMIT_MAX) : 5;
const MAX_KEYS = 10_000;

const attempts = new Map<string, number[]>();

export function checkRateLimit(key: string, now = Date.now()): { allowed: boolean; retryAfter: number } {
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(key, recent);
    const retryAfter = Math.ceil((WINDOW_MS - (now - recent[0]!)) / 1000);
    return { allowed: false, retryAfter };
  }

  recent.push(now);
  attempts.set(key, recent);

  if (attempts.size > MAX_KEYS) {
    for (const [k, times] of attempts) {
      if (times.every((t) => now - t >= WINDOW_MS)) attempts.delete(k);
    }
    // Si sigue lleno, se descartan las claves más antiguas.
    for (const k of attempts.keys()) {
      if (attempts.size <= MAX_KEYS) break;
      attempts.delete(k);
    }
  }
  return { allowed: true, retryAfter: 0 };
}

/**
 * IP del cliente detrás de Traefik: el proxy agrega la IP que ve al final de
 * X-Forwarded-For, así que se toma la última entrada (la primera la controla el cliente).
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const last = forwarded.split(",").map((part) => part.trim()).filter(Boolean).at(-1);
    if (last) return last;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/** Solo para pruebas. */
export function resetRateLimit() {
  attempts.clear();
}

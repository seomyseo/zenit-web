/**
 * Límite de intentos por IP en memoria (ventana deslizante). Suficiente para un solo
 * contenedor; con varias réplicas habría que moverlo a Redis o al proxy.
 */
export function createRateLimiter({ max, windowMs, maxKeys = 10_000 }: { max: number; windowMs: number; maxKeys?: number }) {
  const attempts = new Map<string, number[]>();

  return function check(key: string, now = Date.now()): { allowed: boolean; retryAfter: number } {
    const recent = (attempts.get(key) ?? []).filter((t) => now - t < windowMs);

    if (recent.length >= max) {
      attempts.set(key, recent);
      return { allowed: false, retryAfter: Math.ceil((windowMs - (now - recent[0]!)) / 1000) };
    }

    recent.push(now);
    attempts.delete(key); // reinsertar al final: el orden del Map queda de más antiguo a más reciente
    attempts.set(key, recent);

    if (attempts.size > maxKeys) {
      for (const [k, times] of attempts) {
        if (times.every((t) => now - t >= windowMs)) attempts.delete(k);
      }
      for (const k of attempts.keys()) {
        if (attempts.size <= maxKeys) break;
        attempts.delete(k);
      }
    }
    return { allowed: true, retryAfter: 0 };
  };
}

/**
 * IP del cliente detrás de Traefik. Traefik agrega la IP que ve al final de
 * X-Forwarded-For (lo que venga antes lo controla el cliente), así que se toma la última.
 */
export function clientIp(forwardedFor: string | string[] | undefined, socketIp: string | undefined): string {
  const header = Array.isArray(forwardedFor) ? forwardedFor.join(",") : forwardedFor;
  const last = header
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .at(-1);
  return last || socketIp || "desconocida";
}

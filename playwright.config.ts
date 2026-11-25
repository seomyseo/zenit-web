import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;

/** Servicio zenit-api (bundle real, el mismo que corre en Docker) y su SMTP simulado. */
export const API_PORT = 3101;
export const API_URL = `http://localhost:${API_PORT}`;
export const MOCK_SMTP = "http://localhost:2526";
/** Límite por IP con el que corre zenit-api en las pruebas. */
export const TEST_RATE_LIMIT_MAX = 5;

/**
 * Las pruebas corren sobre el sitio exportado (out/), servido con las mismas reglas
 * que nginx (scripts/serve-out.mjs), que además reenvía /api/ a zenit-api como Traefik.
 * Requiere `pnpm build` antes.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: { baseURL, trace: "on-first-retry" },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 360, height: 780 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: [
    {
      command: "node tests/mock-smtp.mjs --smtp 2525 --http 2526",
      url: `${MOCK_SMTP}/messages`,
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: "pnpm build:api && node services/zenit-api/dist/server.cjs",
      url: `${API_URL}/api/health`,
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        PORT: String(API_PORT),
        SMTP_HOST: "127.0.0.1",
        SMTP_PORT: "2525",
        MAIL_FROM: "Sitio Zenit <web@lefre.com.ve>",
        MAIL_TO: "mercadeo@lefre.com.ve",
        RATE_LIMIT_MAX: String(TEST_RATE_LIMIT_MAX),
      },
    },
    {
      command: `node scripts/serve-out.mjs --port ${PORT} --api ${API_URL}`,
      url: baseURL,
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
});

import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;
/** Webhook simulado (tests/mock-webhook.mjs) en lugar del flujo de n8n. */
export const MOCK_WEBHOOK = "http://localhost:3101";

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
      command: "node tests/mock-webhook.mjs",
      url: MOCK_WEBHOOK,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `pnpm start --port ${PORT}`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        LEADS_WEBHOOK_URL: `${MOCK_WEBHOOK}/hook`,
        LEADS_WEBHOOK_TOKEN: "token-de-prueba-123456",
        LEADS_RATE_LIMIT_MAX: "1000",
      },
    },
  ],
});

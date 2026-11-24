import { defineConfig, devices } from '@playwright/test';

/**
 * E2E contra el stack completo (Caddy + SSR + API + PostgreSQL).
 *
 * Por defecto apunta a http://localhost:8088, el mismo origen que se levanta con
 * `docker compose up -d --build` en la raíz del workspace. Para probar otro
 * entorno, define `E2E_BASE_URL`.
 */
const baseURL = process.env['E2E_BASE_URL'] ?? 'http://localhost:8088';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  // Axe y el render SSR son intensivos en CPU. Con 4 workers las páginas más
  // pesadas agotan el timeout por contención, así que se usan 2 también en
  // local, igual que en CI.
  workers: 2,
  timeout: 45_000,
  expect: {
    timeout: 8_000,
  },
  reporter: process.env['CI']
    ? [['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

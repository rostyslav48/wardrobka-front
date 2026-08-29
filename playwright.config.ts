import { defineConfig, devices } from '@playwright/test';

/**
 * Browser e2e for the Expo Router web build.
 *
 * Requires the backend stack on http://localhost:3000 (see
 * ../wardrobe-assistant-back/test/e2e/README.md) and starts the Expo web dev
 * server itself.
 */
const webPort = process.env.EXPO_WEB_PORT ?? '8081';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/e2e-results.json' }]],
  use: {
    baseURL: process.env.WEB_BASE_URL ?? `http://localhost:${webPort}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 900 },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx expo start --web --port ${webPort}`,
    url: `http://localhost:${webPort}`,
    reuseExistingServer: true,
    timeout: 180_000,
    env: {
      EXPO_PUBLIC_API_BASE_URL: process.env.API_BASE_URL ?? 'http://localhost:3000',
      EXPO_OFFLINE: '1',
      CI: '1',
    },
  },
});

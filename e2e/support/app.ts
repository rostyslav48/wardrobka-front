import { Page, expect, APIRequestContext } from '@playwright/test';

export const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000';

export interface WebUser {
  name: string;
  email: string;
  password: string;
  token: string;
  id: number;
}

/**
 * `POST /auth/signup` is throttled to 5 requests / 60s per IP, so accounts are
 * created through the API with a back-off and then re-used by the UI tests.
 */
export async function createApiUser(
  api: APIRequestContext,
  name = 'Web E2E',
): Promise<WebUser> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const email = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
    const password = 'Password123!';
    const res = await api.post(`${API_BASE_URL}/auth/signup`, {
      data: { name, email, password },
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok()) {
      const body = await res.json();
      return { name, email, password, token: body.accessToken, id: body.id };
    }
    if (res.status() === 429) {
      await new Promise((r) => setTimeout(r, 13_000));
      continue;
    }
    throw new Error(`signup failed (${res.status()}): ${await res.text()}`);
  }
  throw new Error('signup kept returning 429');
}

/** Waits for the Expo bundle to hydrate — Metro serves a shell first. */
export async function openApp(page: Page, path = '/') {
  const consoleErrors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => undefined);
  return consoleErrors;
}

/**
 * `POST /auth/login` is throttled to 10 requests / 60s per IP and the login
 * screen gives no feedback when it is rate limited (BUG-F06), so a failed
 * attempt is retried after the window closes rather than reported as a UI bug.
 */
export async function loginThroughUi(page: Page, user: WebUser) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.getByPlaceholder('Email', { exact: true }).fill(user.email);
    await page.getByPlaceholder('Password', { exact: true }).fill(user.password);
    await page.getByText('Login', { exact: true }).click();

    const loggedIn = await expect(page.getByText('Welcome Back'))
      .toBeHidden({ timeout: 20_000 })
      .then(() => true)
      .catch(() => false);
    if (loggedIn) return;

    // Rate limited — wait for the 60s window to roll over and try again.
    await page.waitForTimeout(45_000);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByText('Welcome Back').waitFor({ timeout: 45_000 });
  }
  await expect(page.getByText('Welcome Back'), 'login never completed').toBeHidden();
}

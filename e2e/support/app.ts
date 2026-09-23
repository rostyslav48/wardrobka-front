import { Page, expect, APIRequestContext } from '@playwright/test';
import { testIds } from './testIds';

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
    await page.getByTestId(testIds.login.emailInput).fill(user.email);
    await page.getByTestId(testIds.login.passwordInput).fill(user.password);
    await page.getByTestId(testIds.login.submitButton).click();

    const loggedIn = await expect(page.getByTestId(testIds.login.heading))
      .toBeHidden({ timeout: 20_000 })
      .then(() => true)
      .catch(() => false);
    if (loggedIn) return;

    // Rate limited — wait for the 60s window to roll over and try again.
    await page.waitForTimeout(45_000);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByTestId(testIds.login.heading).waitFor({ timeout: 45_000 });
  }
  await expect(
    page.getByTestId(testIds.login.heading),
    'login never completed',
  ).toBeHidden();
}

/**
 * Submits credentials expected to fail and waits for "Wrong email or
 * password" - retrying past the same 10 requests/60s login throttle
 * `loginThroughUi` already retries past. A throttled attempt here renders
 * "Something went wrong, please try again." instead (BUG-F06: the real 429
 * body carries no `statusCode`, so the login screen's own 429 branch never
 * matches it), which would otherwise fail the exact-text assertion these
 * tests make regardless of how many other specs' logins ran first.
 */
export async function expectWrongCredentials(page: Page, email: string, password: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.getByTestId(testIds.login.emailInput).fill(email);
    await page.getByTestId(testIds.login.passwordInput).fill(password);
    await page.getByTestId(testIds.login.submitButton).click();

    const shown = await expect(page.getByText('Wrong email or password'))
      .toBeVisible({ timeout: 20_000 })
      .then(() => true)
      .catch(() => false);
    if (shown) return;

    // Rate limited — wait for the 60s window to roll over and try again.
    await page.waitForTimeout(45_000);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByTestId(testIds.login.heading).waitFor({ timeout: 45_000 });
  }
  await expect(
    page.getByText('Wrong email or password'),
    'login error never appeared — stuck behind the login throttle',
  ).toBeVisible();
}

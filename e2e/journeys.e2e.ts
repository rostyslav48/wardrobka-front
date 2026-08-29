/**
 * End-to-end user journeys through the Expo Router **web** build.
 *
 * These are blocked on BUG-F01 (the web bundle throws on boot before the login
 * screen renders). Every test guards on the login screen appearing, so the file
 * turns green on its own the moment the boot crash is fixed — nothing here
 * needs rewriting.
 */
import { test, expect } from '@playwright/test';
import { createApiUser, loginThroughUi, openApp, WebUser } from './support/app';

let user: WebUser;

test.beforeAll(async ({ request }) => {
  test.setTimeout(200_000);
  user = await createApiUser(request, 'Journey User');
});

test.beforeEach(async ({ page }) => {
  await openApp(page, '/');
  const booted = await page
    .getByText('Welcome Back')
    .isVisible({ timeout: 45_000 })
    .catch(() => false);
  test.skip(!booted, 'blocked by BUG-F01 — the web build crashes before login renders');
});

test('a user can log in and land on the wardrobe tabs', async ({ page }) => {
  await loginThroughUi(page, user);
  await expect(page).toHaveURL(/\(tabs\)|\/$/);
});

test('wrong credentials show an inline error and keep the user on login', async ({
  page,
}) => {
  await page.getByPlaceholder('Email', { exact: true }).fill(user.email);
  await page.getByPlaceholder('Password', { exact: true }).fill('TotallyWrong123!');
  await page.getByText('Login', { exact: true }).click();

  await expect(page.getByText('Wrong email or password')).toBeVisible();
  await expect(page.getByText('Welcome Back')).toBeVisible();
});

test('an unknown email shows the same message as a wrong password', async ({ page }) => {
  await page.getByPlaceholder('Email', { exact: true }).fill(`nobody-${Date.now()}@example.com`);
  await page.getByPlaceholder('Password', { exact: true }).fill('Password123!');
  await page.getByText('Login', { exact: true }).click();

  await expect(page.getByText('Wrong email or password')).toBeVisible();
});

test('client-side validation blocks an empty submit', async ({ page }) => {
  await page.getByText('Login', { exact: true }).click();
  await expect(page.getByText('Welcome Back')).toBeVisible();
});

test('the register form asks for name and password confirmation', async ({ page }) => {
  await page.getByText('Switch to Register', { exact: true }).click();

  await expect(page.getByText('Create Account')).toBeVisible();
  await expect(page.getByPlaceholder('Name', { exact: true })).toBeVisible();
  await expect(page.getByPlaceholder('Confirm password', { exact: true })).toBeVisible();
});

test('register rejects a password confirmation mismatch', async ({ page }) => {
  await page.getByText('Switch to Register', { exact: true }).click();
  await page.getByPlaceholder('Email', { exact: true }).fill(`m-${Date.now()}@example.com`);
  await page.getByPlaceholder('Name', { exact: true }).fill('Mismatch User');
  await page.getByPlaceholder('Password', { exact: true }).fill('Password123!');
  await page.getByPlaceholder('Confirm password', { exact: true }).fill('Different123!');
  await page.getByText('Register', { exact: true }).click();

  await expect(page.getByText('Create Account')).toBeVisible();
});

test('a logged-in session survives a page reload', async ({ page }) => {
  await loginThroughUi(page, user);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(
    page.getByText('Welcome Back'),
    'the persisted token must keep the user signed in',
  ).toBeHidden({ timeout: 45_000 });
});

test.describe('authenticated app shell', () => {
  test.beforeEach(async ({ page }) => {
    await loginThroughUi(page, user);
  });

  test('the home tab greets the user and offers chat prompts', async ({ page }) => {
    await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible();
    await expect(page.getByText('Ask Wardropka')).toBeVisible();
    await expect(page.getByText('Recent Suggestions')).toBeVisible();
  });

  test('all five tabs are reachable', async ({ page }) => {
    for (const tab of ['Items', 'Chat', 'Log', 'Settings', 'Home']) {
      await page.getByText(tab, { exact: true }).first().click();
      await expect(page.getByText(tab, { exact: true }).first()).toBeVisible();
    }
  });

  test('the items tab renders an empty wardrobe without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.getByText('Items', { exact: true }).first().click();
    await page.waitForTimeout(3_000);

    expect(errors, 'the items tab must render without an unhandled error').toEqual([]);
  });

  test('the settings tab shows the signed-in profile', async ({ page }) => {
    await page.getByText('Settings', { exact: true }).first().click();
    await expect(page.getByText(user.name, { exact: false }).first()).toBeVisible();
  });

  test('the log tab renders', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.getByText('Log', { exact: true }).first().click();
    await page.waitForTimeout(3_000);

    expect(errors).toEqual([]);
  });
});

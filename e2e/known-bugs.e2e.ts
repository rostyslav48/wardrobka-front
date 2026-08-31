/**
 * Executable reproductions of the front-end defects listed in
 * `planning/qa/BUGS-2026-08-29.md`.
 *
 * All defects below (BUG-F01..F04) are fixed; these run as normal tests now.
 */
import { test, expect } from '@playwright/test';
import { openApp } from './support/app';
import { testIds } from './support/testIds';

test('BUG-F01 the web build crashes on boot instead of rendering the login screen', async ({
  page,
}) => {
  await openApp(page, '/');
  await expect(page.getByTestId(testIds.login.heading)).toBeVisible({ timeout: 60_000 });
});

test('BUG-F02 expo-secure-store is called unguarded on web', async ({ page }) => {
  const errors = await openApp(page, '/');
  await page.waitForTimeout(15_000);

  expect(
    errors.filter((e) => /SecureStore/i.test(e)),
    'AuthContext calls SecureStore.getItemAsync on mount; the module has no web implementation',
  ).toEqual([]);
});

test('BUG-F03 expo-notifications is called unguarded on web', async ({ page }) => {
  const errors = await openApp(page, '/');
  await page.waitForTimeout(15_000);

  expect(
    errors.filter((e) => /ExpoNotifications|getLastNotificationResponse/i.test(e)),
    'useNotificationObserver calls Notifications.useLastNotificationResponse() on every platform',
  ).toEqual([]);
});

test('BUG-F04 the "Forgot Password?" link is inert', async ({ page }) => {
  await openApp(page, '/');
  const booted = await page
    .getByTestId(testIds.login.heading)
    .isVisible()
    .catch(() => false);
  test.skip(!booted, 'blocked by BUG-F01');

  const before = page.url();
  await page.getByTestId(testIds.login.forgotPasswordLink).click();
  await page.waitForTimeout(1_000);
  expect(page.url(), 'the link must navigate somewhere').not.toBe(before);
});

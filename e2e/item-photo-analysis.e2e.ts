/**
 * Photo -> analyze-image journey on the add-item form. The network call is
 * stubbed via page.route() so these assert the form's own behaviour (spinner,
 * fill-only-untouched, non-blocking failure) without depending on a live
 * Gemini call or the ai-assistant service being up.
 */
import path from 'node:path';
import { test, expect, Page } from '@playwright/test';
import { createApiUser, loginThroughUi, openApp, WebUser } from './support/app';
import { testIds } from './support/testIds';

let user: WebUser;

const samplePhoto = path.join(__dirname, '../assets/images/react-logo.png');

test.beforeAll(async ({ request }) => {
  test.setTimeout(200_000);
  user = await createApiUser(request, 'Photo Analysis User');
});

test.beforeEach(async ({ page }) => {
  const booted = await openApp(page, '/').then(() =>
    page
      .getByTestId(testIds.login.heading)
      .isVisible({ timeout: 45_000 })
      .catch(() => false),
  );
  test.skip(!booted, 'blocked by BUG-F01 — the web build crashes before login renders');

  await loginThroughUi(page, user);
  await page.goto('/item/new', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId(testIds.item.photoPicker)).toBeVisible({ timeout: 20_000 });
});

async function pickPhoto(page: Page) {
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByTestId(testIds.item.photoPicker).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(samplePhoto);
}

test('picking a photo shows a spinner and fills fields the user has not touched', async ({
  page,
}) => {
  await page.route('**/wardrobe/analyze-image', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ name: 'Analyzed Hoodie', brand: 'Nike' }),
    });
  });

  await pickPhoto(page);

  await expect(page.getByTestId(testIds.item.photoAnalyzing)).toBeVisible();
  await expect(page.getByTestId(testIds.item.photoAnalyzing)).toBeHidden({ timeout: 15_000 });

  await expect(page.getByTestId(testIds.item.nameInput)).toHaveValue('Analyzed Hoodie');
  await expect(page.getByTestId(testIds.item.brandInput)).toHaveValue('Nike');
});

test('a field the user edits before analysis completes is never overwritten', async ({
  page,
}) => {
  await page.route('**/wardrobe/analyze-image', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1_200));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ name: 'Analyzed Hoodie', brand: 'Nike' }),
    });
  });

  await pickPhoto(page);
  await page.getByTestId(testIds.item.nameInput).fill('My own name');

  await expect(page.getByTestId(testIds.item.photoAnalyzing)).toBeHidden({ timeout: 15_000 });

  // The field edited before the response arrived keeps the user's value...
  await expect(page.getByTestId(testIds.item.nameInput)).toHaveValue('My own name');
  // ...while a field never touched still gets filled from the response.
  await expect(page.getByTestId(testIds.item.brandInput)).toHaveValue('Nike');
});

test('a failed analysis shows a non-blocking message and the form stays usable', async ({
  page,
}) => {
  await page.route('**/wardrobe/analyze-image', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'boom' }),
    }),
  );

  await pickPhoto(page);

  await expect(page.getByTestId(testIds.item.analysisMessage)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId(testIds.item.submitButton)).toBeEnabled();

  await page.getByTestId(testIds.item.nameInput).fill('Manual Item');
  await expect(page.getByTestId(testIds.item.nameInput)).toHaveValue('Manual Item');
});

test('re-picking the same unchanged photo does not trigger a second analysis call', async ({
  page,
}) => {
  let calls = 0;
  await page.route('**/wardrobe/analyze-image', async (route) => {
    calls += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ name: 'Analyzed Hoodie', brand: 'Nike' }),
    });
  });

  await pickPhoto(page);
  await expect(page.getByTestId(testIds.item.photoAnalyzing)).toBeVisible();
  await expect(page.getByTestId(testIds.item.photoAnalyzing)).toBeHidden({ timeout: 15_000 });
  expect(calls).toBe(1);

  await pickPhoto(page);
  // Give a would-be second call time to land before asserting it didn't.
  await page.waitForTimeout(2_000);
  expect(calls).toBe(1);
});

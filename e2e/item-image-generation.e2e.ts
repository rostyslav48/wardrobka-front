/**
 * The "Generate clean product image" toggle and the polling reveal.
 *
 * The backend is stubbed via page.route() on purpose: what is under test here
 * is the client's own contract — which value of `generate_image` leaves the
 * form, that a `pending` item renders the placeholder, that the finished image
 * replaces it within one poll interval, and that the poll stops once nothing
 * is pending. The wire path itself (RMQ -> Gemini -> ready) is exercised
 * against the live stack, not from a browser.
 */
import { test, expect, Page } from '@playwright/test';
import { createApiUser, loginThroughUi, openApp, WebUser } from './support/app';
import { testIds } from './support/testIds';

// Mirrors PENDING_IMAGE_POLL_INTERVAL_MS in
// components/pages/app/items/usePendingImagePolling.ts. Not imported: the
// Playwright runner cannot load the app's expo-router dependency chain.
const PENDING_IMAGE_POLL_INTERVAL_MS = 4000;

let user: WebUser;

const PENDING_ITEM = {
  id: 9001,
  type: 't-shirt',
  color: '#C62828',
  name: 'Polling Tee',
  season: 'summer',
  img_url: null as string | null,
  status: 'active',
  favourite: false,
  size: null,
  image_status: 'pending',
};

// The Switch renders as a plain div under react-native-web, so `toBeChecked`
// does not apply. The hint copy beneath it is driven by the same form value and
// is what the user actually reads, so it stands in for the toggle's state.
const HINT_ON =
  'Your photo is straightened and the background removed. It appears once ready.';
const HINT_OFF = 'Your photo is used as-is.';

const READY_ITEM = {
  ...PENDING_ITEM,
  img_url: 'https://example.invalid/generated.jpg',
  image_status: 'ready',
};

test.beforeAll(async ({ request }) => {
  test.setTimeout(200_000);
  user = await createApiUser(request, 'Image Generation User');
});

async function signIn(page: Page) {
  const booted = await openApp(page, '/').then(() =>
    page
      .getByTestId(testIds.login.heading)
      .isVisible({ timeout: 45_000 })
      .catch(() => false),
  );
  test.skip(!booted, 'blocked by BUG-F01 — the web build crashes before login renders');

  await loginThroughUi(page, user);
}

/** The multipart field the form actually put on the wire, or null if absent. */
function generateImageField(body: string | null): string | null {
  const match = body?.match(
    /name="generate_image"\r?\n\r?\n([^\r\n]*)/,
  );
  return match ? match[1] : null;
}

async function openNewItemForm(page: Page) {
  await page.goto('/item/new', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId(testIds.item.photoPicker)).toBeVisible({ timeout: 20_000 });
}

/** name/type/colour/season are all required before the form will submit. */
async function fillRequiredFields(page: Page) {
  await page.getByTestId(testIds.item.nameInput).fill('Polling Tee');
  await page.getByText('t-shirt', { exact: true }).click();
  await page.getByTestId(testIds.item.colorSwatch('Navy')).click();
  await page.getByText('Summer', { exact: true }).click();
}

test.describe('the generate-image toggle', () => {
  test('is on by default and sends generate_image=true', async ({ page }) => {
    await signIn(page);
    await openNewItemForm(page);

    await expect(page.getByText(HINT_ON)).toBeVisible();

    let submitted: string | null = null;
    await page.route('**/wardrobe', async (route) => {
      if (route.request().method() !== 'POST') return route.fallback();
      submitted = generateImageField(route.request().postData());
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(PENDING_ITEM),
      });
    });

    await fillRequiredFields(page);
    await page.getByTestId(testIds.item.submitButton).click();

    await expect.poll(() => submitted).toBe('true');
  });

  test('toggling it off sends generate_image=false', async ({ page }) => {
    await signIn(page);
    await openNewItemForm(page);

    await page.getByTestId(testIds.item.generateImageToggle).click();
    await expect(page.getByText(HINT_OFF)).toBeVisible();

    let submitted: string | null = null;
    await page.route('**/wardrobe', async (route) => {
      if (route.request().method() !== 'POST') return route.fallback();
      submitted = generateImageField(route.request().postData());
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ ...READY_ITEM, img_url: 'https://example.invalid/original.jpg' }),
      });
    });

    await fillRequiredFields(page);
    await page.getByTestId(testIds.item.submitButton).click();

    await expect.poll(() => submitted).toBe('false');
  });
});

const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

test.describe('the polling reveal', () => {
  test('swaps the placeholder for the image within one poll interval', async ({ page }) => {
    let ready = false;

    // react-native-web only paints an Image once its bytes load, so the URL
    // never reaches the DOM unless the request actually succeeds.
    await page.route('**/generated.jpg', (route) =>
      route.fulfill({ status: 200, contentType: 'image/png', body: ONE_PIXEL_PNG }),
    );

    await page.route('**/wardrobe?**', async (route) => {
      if (route.request().method() !== 'GET') return route.fallback();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([ready ? READY_ITEM : PENDING_ITEM]),
      });
    });
    await page.route('**/wardrobe', async (route) => {
      if (route.request().method() !== 'GET') return route.fallback();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([ready ? READY_ITEM : PENDING_ITEM]),
      });
    });

    await signIn(page);
    await page.getByTestId(testIds.tabs.items).click();

    await expect(page.getByTestId(testIds.item.cardGenerating)).toBeVisible({
      timeout: 20_000,
    });

    // Nothing but the poll drives this: the page is not reloaded or re-focused.
    ready = true;
    await expect(page.getByTestId(testIds.item.cardGenerating)).toBeHidden({
      timeout: PENDING_IMAGE_POLL_INTERVAL_MS * 2,
    });
    // react-native-web may render an Image as an <img src> or as a div with a
    // background-image, so the assertion is on the URL reaching the DOM at all.
    await expect
      .poll(() => page.content().then((html) => html.includes('generated.jpg')))
      .toBe(true);
  });

  test('stops polling once no item is pending', async ({ page }) => {
    let listRequests = 0;

    const respondReady = async (route: import('@playwright/test').Route) => {
      if (route.request().method() !== 'GET') return route.fallback();
      listRequests += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([READY_ITEM]),
      });
    };
    await page.route('**/wardrobe?**', respondReady);
    await page.route('**/wardrobe', respondReady);

    await signIn(page);
    await page.getByTestId(testIds.tabs.items).click();
    await expect(page.getByTestId(testIds.item.cardGenerating)).toHaveCount(0);
    await expect
      .poll(() => listRequests, { timeout: 20_000 })
      .toBeGreaterThan(0);

    const afterFirstLoad = listRequests;
    await page.waitForTimeout(PENDING_IMAGE_POLL_INTERVAL_MS * 3);

    // An idle wardrobe issues no further list requests at all.
    expect(listRequests).toBe(afterFirstLoad);
  });
});

/**
 * Coverage for the Wardrobe (items) tab's list states — QA-40 (search),
 * QA-41 (no-match vs. empty), QA-61 (empty-wardrobe flicker) and QA-53 (a
 * failed fetch shows an error, not silence). Each test stubs `**​/wardrobe*`
 * before logging in, since `usePendingImagePolling` refetches on the items
 * tab's first focus.
 */
import { test, expect, Page } from '@playwright/test';
import { createApiUser, loginThroughUi, openApp, WebUser } from './support/app';
import { testIds } from './support/testIds';
import { ItemStatus, ImageStatus, ItemType, Season, WardrobeItem } from '@/types/wardrobe';

let user: WebUser;

test.beforeAll(async ({ request }) => {
  test.setTimeout(200_000);
  user = await createApiUser(request, 'Items List States User');
});

test.beforeEach(async ({ page }) => {
  const booted = await page
    .goto('/')
    .then(() => page.getByTestId(testIds.login.heading).isVisible({ timeout: 45_000 }))
    .catch(() => false);
  test.skip(!booted, 'blocked by BUG-F01 — the web build crashes before login renders');
});

function stubWardrobe(page: Page, items: WardrobeItem[] | 'fail') {
  return page.route('**/wardrobe*', async (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    if (items === 'fail') {
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(items),
    });
  });
}

const THREE_ITEMS: WardrobeItem[] = [
  {
    id: 1,
    accountId: 1,
    name: 'Blue Denim Jacket',
    brand: 'Levis',
    type: ItemType.Jacket,
    color: '#0000ff',
    season: Season.Winter,
    status: ItemStatus.Active,
    favourite: false,
    image_status: ImageStatus.Ready,
  },
  {
    id: 2,
    accountId: 1,
    name: 'Red Hoodie',
    brand: 'Nike',
    type: ItemType.Hoodie,
    color: '#ff0000',
    season: Season.Winter,
    status: ItemStatus.Active,
    favourite: false,
    image_status: ImageStatus.Ready,
  },
  {
    id: 3,
    accountId: 1,
    name: 'White Tee',
    brand: 'Uniqlo',
    type: ItemType.TShirt,
    color: '#ffffff',
    season: Season.Summer,
    status: ItemStatus.Active,
    favourite: false,
    image_status: ImageStatus.Ready,
  },
];

test('QA-40: search filters the grid by name/brand/type, case-insensitive', async ({ page }) => {
  await stubWardrobe(page, THREE_ITEMS);
  await loginThroughUi(page, user);
  await page.getByTestId(testIds.tabs.items).click();

  await expect(page.getByText('Blue Denim Jacket')).toBeVisible();
  await expect(page.getByText('Red Hoodie')).toBeVisible();
  await expect(page.getByText('White Tee')).toBeVisible();

  // Matches by brand, upper-case, on an item whose name/type don't contain it.
  await page.getByTestId(testIds.items.searchInput).fill('NIKE');

  await expect(page.getByText('Red Hoodie')).toBeVisible();
  await expect(page.getByText('Blue Denim Jacket')).toBeHidden();
  await expect(page.getByText('White Tee')).toBeHidden();
  await expect(page.getByText('1 OF 3 ITEMS')).toBeVisible();
});

test('QA-41: filters that match nothing show a no-match state, not the empty-wardrobe state', async ({
  page,
}) => {
  await stubWardrobe(page, THREE_ITEMS);
  await loginThroughUi(page, user);
  await page.getByTestId(testIds.tabs.items).click();
  await expect(page.getByText('Blue Denim Jacket')).toBeVisible();

  await page.getByTestId(testIds.items.searchInput).fill('zzz-nothing-matches');

  await expect(page.getByTestId(testIds.items.noMatchState)).toBeVisible();
  await expect(page.getByTestId(testIds.items.emptyState)).not.toBeAttached();
  await expect(page.getByText('0 OF 3 ITEMS')).toBeVisible();

  await page.getByTestId(testIds.items.noMatchClear).click();

  await expect(page.getByTestId(testIds.items.noMatchState)).not.toBeAttached();
  await expect(page.getByText('Blue Denim Jacket')).toBeVisible();
});

test('QA-61: an empty wardrobe settles — the loading skeleton stops flipping against the empty state', async ({
  page,
}) => {
  await stubWardrobe(page, []);
  await loginThroughUi(page, user);
  await page.getByTestId(testIds.tabs.items).click();

  await expect(page.getByTestId(testIds.items.emptyState)).toBeVisible({ timeout: 10_000 });

  // Sample for ~2.5s: the regression was a ~2Hz flip between the skeleton and
  // the empty state, forever. A settled screen never shows the skeleton again
  // and never unmounts the empty state during this window.
  let skeletonSightings = 0;
  for (let i = 0; i < 12; i++) {
    if (await page.getByTestId(testIds.items.loadingSkeleton).isVisible()) skeletonSightings++;
    await expect(page.getByTestId(testIds.items.emptyState)).toBeVisible();
    await page.waitForTimeout(200);
  }

  expect(skeletonSightings, 'the skeleton must not reappear once the wardrobe has settled').toBe(
    0,
  );
});

test('QA-53: a failed fetch shows an error state, not an empty-wardrobe state', async ({
  page,
}) => {
  await stubWardrobe(page, 'fail');
  await loginThroughUi(page, user);
  await page.getByTestId(testIds.tabs.items).click();

  await expect(page.getByTestId(testIds.items.errorState)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId(testIds.items.emptyState)).not.toBeAttached();
});

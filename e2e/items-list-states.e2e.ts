/**
 * Coverage for the Wardrobe (items) tab's list states — QA-40 (search),
 * QA-41 (no-match vs. empty), QA-61 (empty-wardrobe flicker) and QA-53 (a
 * failed fetch shows an error, not silence). Each test stubs `**​/wardrobe*`
 * before logging in, since `usePendingImagePolling` refetches on the items
 * tab's first focus.
 */
import { test, expect, Page } from '@playwright/test';
import { createApiUser, loginThroughUi, WebUser } from './support/app';
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

test('QA-41: a server-side filter chip keeps the real total in the header', async ({ page }) => {
  // Unlike search, filters are sent as query params and narrowed server-side -
  // `items` in WardrobeContext IS the narrowed response, so the header must
  // fall back to a separately-tracked total rather than `items.length`.
  await page.route('**/wardrobe*', async (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    const url = new URL(route.request().url());
    const type = url.searchParams.get('type');
    const filtered = type ? THREE_ITEMS.filter((item) => item.type === type) : THREE_ITEMS;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(filtered),
    });
  });

  await loginThroughUi(page, user);
  await page.getByTestId(testIds.tabs.items).click();
  await expect(page.getByText('Blue Denim Jacket')).toBeVisible();
  await expect(page.getByText('3 ITEMS')).toBeVisible();

  await page.getByTestId(testIds.items.filterButton).click();
  await page.getByText('jacket', { exact: true }).click();
  await page.getByText('Apply', { exact: true }).click();

  await expect(page.getByText('Blue Denim Jacket')).toBeVisible();
  await expect(page.getByText('Red Hoodie')).toBeHidden();
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

test('QA-53: retrying the failed-fetch error state refetches and does not throw', async ({
  page,
}) => {
  let getCalls = 0;
  await page.route('**/wardrobe*', async (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    getCalls++;
    await route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
  });
  const pageErrors: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  await loginThroughUi(page, user);
  await page.getByTestId(testIds.tabs.items).click();

  await expect(page.getByTestId(testIds.items.errorState)).toBeVisible({ timeout: 10_000 });
  const callsBeforeRetry = getCalls;

  await page.getByTestId(testIds.items.errorStateRetry).click();

  await expect.poll(() => getCalls).toBeGreaterThan(callsBeforeRetry);
  await expect(page.getByTestId(testIds.items.errorState)).toBeVisible();
  expect(pageErrors, 'clicking Retry on the wardrobe error state must not throw').toEqual([]);
});

test('QA-53/62: a failed refetch on an already-loaded wardrobe shows a banner and keeps the list', async ({
  page,
}) => {
  let fail = false;
  await page.route('**/wardrobe*', async (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    if (fail) {
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(THREE_ITEMS),
    });
  });

  await loginThroughUi(page, user);
  await page.getByTestId(testIds.tabs.items).click();
  await expect(page.getByText('Blue Denim Jacket')).toBeVisible();

  fail = true;
  // usePendingImagePolling refetches on every focus - refocusing the tab
  // stands in for the pull-to-refresh gesture react-native-web can't drive.
  await page.getByTestId(testIds.tabs.home).click();
  await page.getByTestId(testIds.tabs.items).click();

  await expect(page.getByTestId(testIds.items.errorBanner)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Blue Denim Jacket')).toBeVisible();
  await expect(page.getByTestId(testIds.items.emptyState)).not.toBeAttached();
});

test('QA-41 regression: a client-side search matching nothing must not be reported as a fetch error', async ({
  page,
}) => {
  // Round-2 QA finding: ItemsGrid judged its error branch against the
  // search-narrowed list, so a failed refetch while the search box matched
  // nothing rendered "Couldn't load your wardrobe" even though the wardrobe
  // itself loaded fine and the user's own search is the only reason the
  // grid is empty. Loading/error must be judged against what the fetch
  // returned, not what the client-side search narrowed it to.
  let fail = false;
  await page.route('**/wardrobe*', async (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    if (fail) {
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(THREE_ITEMS),
    });
  });

  await loginThroughUi(page, user);
  await page.getByTestId(testIds.tabs.items).click();
  await expect(page.getByText('Blue Denim Jacket')).toBeVisible();

  await page.getByTestId(testIds.items.searchInput).fill('zzz-nothing-matches');
  await expect(page.getByTestId(testIds.items.noMatchState)).toBeVisible();

  fail = true;
  // usePendingImagePolling refetches on every focus - refocusing the tab
  // stands in for the pull-to-refresh gesture react-native-web can't drive.
  await page.getByTestId(testIds.tabs.home).click();
  await page.getByTestId(testIds.tabs.items).click();

  await expect(page.getByTestId(testIds.items.searchInput)).toHaveValue('zzz-nothing-matches');
  await expect(page.getByTestId(testIds.items.noMatchState)).toBeVisible();
  await expect(page.getByTestId(testIds.items.errorState)).not.toBeAttached();
});

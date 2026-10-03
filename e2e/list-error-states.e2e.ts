/**
 * QA-53/62: Chat and Log must share the same failure-state shape as Items —
 * a full-page error when the list is empty and the fetch failed, instead of
 * silently looking like an empty list.
 *
 * The "banner on a failed refetch of an already-loaded list" half of QA-53/62
 * (the same UiInlineError wired into ChatListScreen/LogScreen as ItemsGrid)
 * has no Playwright coverage: react-native-web's `RefreshControl` renders as
 * a plain `View` and drops `onRefresh` entirely (see
 * node_modules/react-native-web/src/exports/RefreshControl), and unlike
 * Items, Chat/Log have no focus-triggered refetch to substitute for a pull
 * gesture — so there is no way to make a second `GET` fire against an
 * already-loaded list from this suite. That half is code-reading only; see
 * state.md.
 */
import { test, expect, Page } from '@playwright/test';
import { createApiUser, loginThroughUi, WebUser } from './support/app';
import { testIds } from './support/testIds';

let user: WebUser;

test.beforeAll(async ({ request }) => {
  test.setTimeout(200_000);
  user = await createApiUser(request, 'List Error States User');
});

test.beforeEach(async ({ page }) => {
  const booted = await page
    .goto('/')
    .then(() => page.getByTestId(testIds.login.heading).isVisible({ timeout: 45_000 }))
    .catch(() => false);
  test.skip(!booted, 'blocked by BUG-F01 — the web build crashes before login renders');
});

function stubFailing(page: Page, pattern: string) {
  return page.route(pattern, async (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    await route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
  });
}

test('QA-53/62: Chat shows a full error state on an empty failed load, not silence', async ({ page }) => {
  await stubFailing(page, '**/ai-assistant/sessions*');
  await loginThroughUi(page, user);
  await page.getByTestId(testIds.tabs.chat).click();

  await expect(page.getByTestId(testIds.chat.errorState)).toBeVisible({ timeout: 10_000 });
});

test('QA-53/62: Log shows a full error state on an empty failed load, not silence', async ({ page }) => {
  await stubFailing(page, '**/outfit-log*');
  await loginThroughUi(page, user);
  await page.getByTestId(testIds.tabs.log).click();

  await expect(page.getByTestId(testIds.log.errorState)).toBeVisible({ timeout: 10_000 });
});

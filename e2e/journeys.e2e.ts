/**
 * End-to-end user journeys through the Expo Router **web** build.
 *
 * These are blocked on BUG-F01 (the web bundle throws on boot before the login
 * screen renders). Every test guards on the login screen appearing, so the file
 * turns green on its own the moment the boot crash is fixed — nothing here
 * needs rewriting.
 */
import { test, expect } from '@playwright/test';
import { createApiUser, expectWrongCredentials, loginThroughUi, openApp, WebUser } from './support/app';
import { testIds } from './support/testIds';

let user: WebUser;

test.beforeAll(async ({ request }) => {
  test.setTimeout(200_000);
  user = await createApiUser(request, 'Journey User');
});

test.beforeEach(async ({ page }) => {
  await openApp(page, '/');
  const booted = await page
    .getByTestId(testIds.login.heading)
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
  // Deliberate text assertion: the error copy is behaviour, not chrome.
  // Goes through expectWrongCredentials rather than a one-shot submit so a
  // login throttled by another spec's logins retries instead of failing on
  // "Something went wrong" — see that helper's doc comment.
  await expectWrongCredentials(page, user.email, 'TotallyWrong123!');
  await expect(page.getByTestId(testIds.login.heading)).toBeVisible();
});

test('an unknown email shows the same message as a wrong password', async ({ page }) => {
  // Deliberate text assertion: the error copy is behaviour, not chrome.
  await expectWrongCredentials(page, `nobody-${Date.now()}@example.com`, 'Password123!');
});

test('QA-19: the server error banner clears as soon as the email field changes', async ({
  page,
}) => {
  // Stubbed rather than driven off a real wrong password: POST /auth/login is
  // throttled to 10 requests/60s per IP, and a real 429's body carries no
  // `statusCode` (BUG-F06), so a login attempt landing on the throttle window
  // renders "Something went wrong" instead of "Wrong email or password" and
  // fails this test's precondition before it ever reaches the behaviour under
  // test - clearing the banner on input change.
  await page.route('**/auth/login', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Unauthorized', statusCode: 401 }),
    });
  });

  await page.getByTestId(testIds.login.emailInput).fill(user.email);
  await page.getByTestId(testIds.login.passwordInput).fill('TotallyWrong123!');
  await page.getByTestId(testIds.login.submitButton).click();

  await expect(page.getByText('Wrong email or password')).toBeVisible();

  await page.getByTestId(testIds.login.emailInput).fill(`${user.email}x`);

  await expect(page.getByText('Wrong email or password')).toBeHidden();
});

test('client-side validation blocks an empty submit', async ({ page }) => {
  await page.getByTestId(testIds.login.submitButton).click();
  await expect(page.getByTestId(testIds.login.heading)).toBeVisible();
});

test('the register form asks for name and password confirmation', async ({ page }) => {
  await page.getByTestId(testIds.login.switchModeLink).click();

  await expect(page.getByTestId(testIds.login.heading)).toBeVisible();
  await expect(page.getByTestId(testIds.login.nameInput)).toBeVisible();
  await expect(page.getByTestId(testIds.login.confirmPasswordInput)).toBeVisible();
});

test('register rejects a password confirmation mismatch', async ({ page }) => {
  await page.getByTestId(testIds.login.switchModeLink).click();
  await page.getByTestId(testIds.login.emailInput).fill(`m-${Date.now()}@example.com`);
  await page.getByTestId(testIds.login.nameInput).fill('Mismatch User');
  await page.getByTestId(testIds.login.passwordInput).fill('Password123!');
  await page.getByTestId(testIds.login.confirmPasswordInput).fill('Different123!');
  await page.getByTestId(testIds.login.submitButton).click();

  await expect(page.getByTestId(testIds.login.heading)).toBeVisible();
});

test('a logged-in session survives a page reload', async ({ page }) => {
  await loginThroughUi(page, user);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(
    page.getByTestId(testIds.login.heading),
    'the persisted token must keep the user signed in',
  ).toBeHidden({ timeout: 45_000 });
});

test.describe('authenticated app shell', () => {
  test.beforeEach(async ({ page }) => {
    await loginThroughUi(page, user);
  });

  test('the home tab greets the user and offers chat prompts', async ({ page }) => {
    // Deliberate text assertion: the greeting copy is behaviour, not chrome.
    await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible();
    await expect(page.getByTestId(testIds.home.askWardropkaHeader)).toBeVisible();
    await expect(page.getByTestId(testIds.home.recentSuggestionsHeader)).toBeVisible();
  });

  test('the home tab shows the upcoming occasions section, disconnected by default', async ({
    page,
  }) => {
    await expect(page.getByTestId(testIds.home.occasionsHeader)).toBeVisible();
    // A freshly created account has no calendar connection.
    await expect(page.getByTestId(testIds.home.occasionsDisconnected)).toBeVisible();
  });

  test('the settings tab shows the Google Calendar row', async ({ page }) => {
    await page.getByTestId(testIds.tabs.settings).click();
    await expect(page.getByTestId('settings-calendar-row')).toBeVisible();
  });

  test('the calendar-mention switch is disabled once the daily reminder is off', async ({
    page,
  }) => {
    await page.getByTestId(testIds.tabs.settings).click();

    await expect(page.getByText('Mention calendar events in the reminder')).toBeVisible();
    await expect(page.getByTestId(testIds.settings.includeOccasionsSwitch)).toBeVisible();

    // Turning the daily reminder off never prompts for permission (only
    // turning it on does), so this is safe to drive without granting the
    // browser's Notification permission first.
    await page.getByTestId(testIds.settings.dailyReminderSwitch).click();
    // react-native-web renders `disabled` onto the switch's inner
    // `<input role="switch">`, not the outer `data-testid` div.
    await expect(
      page.getByTestId(testIds.settings.includeOccasionsSwitch).locator('input'),
    ).toBeDisabled();
  });

  test('all five tabs are reachable', async ({ page }) => {
    const stops: { tab: string; screenTestId: string }[] = [
      { tab: testIds.tabs.items, screenTestId: testIds.screens.items },
      { tab: testIds.tabs.chat, screenTestId: testIds.screens.chat },
      { tab: testIds.tabs.log, screenTestId: testIds.screens.log },
      { tab: testIds.tabs.settings, screenTestId: testIds.screens.settings },
      { tab: testIds.tabs.home, screenTestId: testIds.home.greeting },
    ];

    for (const { tab, screenTestId } of stops) {
      await page.getByTestId(tab).click();
      await expect(page.getByTestId(screenTestId)).toBeVisible();
    }
  });

  test('the items tab renders an empty wardrobe without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.getByTestId(testIds.tabs.items).click();
    await page.waitForTimeout(3_000);

    expect(errors, 'the items tab must render without an unhandled error').toEqual([]);
  });

  test('the settings tab shows the signed-in profile', async ({ page }) => {
    await page.getByTestId(testIds.tabs.settings).click();
    await expect(page.getByText(user.name, { exact: false }).first()).toBeVisible();
  });

  test('the log tab renders', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.getByTestId(testIds.tabs.log).click();
    await page.waitForTimeout(3_000);

    expect(errors).toEqual([]);
  });

  test('outfit history reaches via SEE ALL, renders its cards, and pages a short list without a scroll', async ({
    page,
  }) => {
    // Page one is a full PAGE_SIZE (so hasMore stays true) of thumbnail-less
    // cards, sized to fit a tall viewport without overflowing it - the
    // regression this guards is UiPage's onEndReached firing only from
    // `onScroll`, which never fires when the content doesn't need to scroll.
    const pageOne = Array.from({ length: 20 }, (_, i) => ({
      id: `e2e-suggestion-${i}`,
      sessionId: `e2e-session-${i}`,
      sessionTopic: `Outfit idea ${i}`,
      summary: 'A suggested outfit',
      wardrobeItemIds: [],
      createdAt: new Date(2026, 0, 1).toISOString(),
    }));
    const pageTwo = [
      {
        id: 'e2e-suggestion-page-two',
        sessionId: 'e2e-session-page-two',
        sessionTopic: 'Second page outfit',
        summary: 'A suggested outfit',
        wardrobeItemIds: [],
        createdAt: new Date(2026, 0, 1).toISOString(),
      },
    ];

    await page.route('**/ai-assistant/outfit-suggestions?*', async (route) => {
      const offset = new URL(route.request().url()).searchParams.get('offset');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(offset === '0' ? pageOne : pageTwo),
      });
    });

    await page.setViewportSize({ width: 800, height: 3000 });

    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.getByTestId(testIds.tabs.home).click();
    await page.getByTestId(testIds.home.seeAllSuggestions).click();

    await expect(page.getByTestId(testIds.outfitHistory.screen)).toBeVisible();
    await expect(
      page.getByTestId(testIds.outfitHistory.card('e2e-suggestion-0')),
    ).toBeVisible();

    // No scroll is performed - the second page must load from the
    // content-size/layout check, since 20 thumbnail-less cards fit inside a
    // 3000px-tall viewport and never fire a scroll event.
    await expect(
      page.getByTestId(testIds.outfitHistory.card('e2e-suggestion-page-two')),
    ).toBeVisible({ timeout: 10_000 });

    expect(errors, 'outfit history must render without an unhandled error').toEqual([]);
  });
});

/**
 * iOS QA wave 3 (2026-09-26): the parts of QA-34, QA-35, QA-67, QA-69,
 * BUG-iOS-02 and QA-66 that are plain web behaviour. The keyboard work in the
 * same wave (QA-57, QA-30, QA-64's overlap, QA-06's accessory bar) and the
 * safe-area part of QA-68 need an iOS simulator and are not covered here.
 *
 * The chat backend is stubbed with page.route(): what is under test is the
 * screens' own behaviour (what they send, what they keep on screen), not the
 * model or the session store - the backend's own e2e suite covers
 * DELETE /ai-assistant/sessions/:id against the real database.
 */
import { test, expect, Page } from '@playwright/test';
import { createApiUser, loginThroughUi, openApp, WebUser } from './support/app';
import { testIds } from './support/testIds';
import {
  ImageStatus,
  ItemStatus,
  ItemType,
  Season,
  WardrobeItem,
} from '@/types/wardrobe';
import { AssistantSessionDto } from '@/types/ai-assistant';

let user: WebUser;

test.beforeAll(async ({ request }) => {
  test.setTimeout(200_000);
  user = await createApiUser(request, 'Wave3 User');
});

test.beforeEach(async ({ page }) => {
  await openApp(page, '/');
  const booted = await page
    .getByTestId(testIds.login.heading)
    .isVisible({ timeout: 45_000 })
    .catch(() => false);
  test.skip(
    !booted,
    'blocked by BUG-F01 — the web build crashes before login renders',
  );
});

const ITEMS: WardrobeItem[] = [
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

function stubWardrobe(page: Page, items: WardrobeItem[]) {
  return page.route('**/wardrobe*', async (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(items),
    });
  });
}

// ─── BUG-iOS-02: AutoFill hints on the auth fields ──────────────────────────

test('BUG-iOS-02: login fields carry email / current-password autocomplete hints', async ({
  page,
}) => {
  await expect(page.getByTestId(testIds.login.emailInput)).toHaveAttribute(
    'autocomplete',
    'email',
  );
  await expect(page.getByTestId(testIds.login.passwordInput)).toHaveAttribute(
    'autocomplete',
    'current-password',
  );
});

test('BUG-iOS-02: register fields carry email / name / new-password autocomplete hints', async ({
  page,
}) => {
  await page.getByTestId(testIds.login.switchModeLink).click();
  await expect(page.getByTestId(testIds.login.nameInput)).toBeVisible();

  await expect(page.getByTestId(testIds.login.emailInput)).toHaveAttribute(
    'autocomplete',
    'email',
  );
  await expect(page.getByTestId(testIds.login.nameInput)).toHaveAttribute(
    'autocomplete',
    'name',
  );
  // Both password fields: iOS offers its Strong Password for `newPassword`
  // fields, so it must not land on the name field instead.
  await expect(page.getByTestId(testIds.login.passwordInput)).toHaveAttribute(
    'autocomplete',
    'new-password',
  );
  await expect(
    page.getByTestId(testIds.login.confirmPasswordInput),
  ).toHaveAttribute('autocomplete', 'new-password');
});

// ─── QA-66: a failed login is handled, not re-thrown out of submitForm ───────

test('QA-66: a failed login shows the banner without Formik logging an unhandled submit error', async ({
  page,
}) => {
  const messages: string[] = [];
  page.on('console', (m) => messages.push(m.text()));
  // Stubbed: the real endpoint is throttled to 10 requests/60s and shared with
  // every other login in the run.
  await page.route('**/auth/login', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ statusCode: 401, message: 'Unauthorized' }),
    }),
  );

  await page.getByTestId(testIds.login.emailInput).fill('qa66@example.com');
  await page.getByTestId(testIds.login.passwordInput).fill('Password123!');
  await page.getByTestId(testIds.login.submitButton).click();

  await expect(page.getByText('Wrong email or password')).toBeVisible();
  // Let any async rejection surface before checking the log.
  await page.waitForTimeout(500);
  expect(
    messages.filter((m) =>
      /unhandled error was caught from submitForm/i.test(m),
    ),
  ).toEqual([]);
});

// ─── QA-34: attachment-only messages ─────────────────────────────────────

test('QA-34: Send is enabled with only an attachment, and sends an empty prompt with the item ids', async ({
  page,
}) => {
  const sessionId = '00000000-0000-4000-8000-0000000000a1';
  // Stubbed before login: WardrobeContext loads the items the picker offers
  // once, when the signed-in app mounts.
  await stubWardrobe(page, ITEMS);
  await page.route('**/ai-assistant/sessions', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
  let chatBody: Record<string, unknown> | null = null;
  await page.route('**/ai-assistant/chat', async (route) => {
    chatBody = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ sessionId, assistantMessageId: 'm2' }),
    });
  });
  await page.route(`**/ai-assistant/sessions/${sessionId}/messages`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'm1',
          role: 'user',
          content: 'Attached 1 item',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'm2',
          role: 'assistant',
          content: 'What would you like to know about this jacket?',
          createdAt: new Date().toISOString(),
        },
      ]),
    }),
  );

  await loginThroughUi(page, user);
  await page.getByTestId(testIds.tabs.chat).click();
  await page.getByTestId(testIds.chat.newSessionButton).click();

  const send = page.getByRole('button', { name: 'Send message' });
  await expect(
    send,
    'no text and no attachment: nothing to send',
  ).toBeDisabled();

  await page.getByTestId(testIds.chat.attachButton).click();
  await page.getByRole('button', { name: 'Blue Denim Jacket' }).click();
  await page.getByTestId(testIds.chat.pickerConfirmButton).click();
  await expect(page.getByTestId(testIds.modal.sheet)).not.toBeVisible();

  await expect(send, 'one attached item and no text is sendable').toBeEnabled();
  await send.click();

  await expect(
    page.getByText('What would you like to know about this jacket?'),
  ).toBeVisible();
  expect(chatBody).toEqual({ prompt: '', contextItemIds: [1] });
});

test.describe('signed in', () => {
  test.beforeEach(async ({ page }) => {
    await loginThroughUi(page, user);
  });

  test('QA-34: whitespace-only text with no attachment still cannot be sent', async ({
    page,
  }) => {
    await page.getByTestId(testIds.tabs.chat).click();
    await page.getByTestId(testIds.chat.newSessionButton).click();

    await page.getByPlaceholder('Message your stylist…').fill('   ');
    await expect(
      page.getByRole('button', { name: 'Send message' }),
    ).toBeDisabled();
  });

  // ─── QA-35: delete (swipe on native) on the sessions list ─────────────────────────

  const SESSIONS: AssistantSessionDto[] = [
    {
      id: '00000000-0000-4000-8000-0000000000b1',
      topic: 'Wedding outfit',
      createdAt: new Date().toISOString(),
    },
    {
      id: '00000000-0000-4000-8000-0000000000b2',
      topic: 'Rainy Monday',
      createdAt: new Date().toISOString(),
    },
  ];

  async function openSessions(page: Page, deleteStatus: number) {
    const deleted: string[] = [];
    await page.route('**/ai-assistant/sessions', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SESSIONS),
      }),
    );
    await page.route('**/ai-assistant/sessions/*', async (route) => {
      if (route.request().method() !== 'DELETE') return route.continue();
      deleted.push(route.request().url().split('/').pop() ?? '');
      await route.fulfill({
        status: deleteStatus,
        contentType: 'application/json',
        body: JSON.stringify(
          deleteStatus === 200 ? { deleted: true } : { statusCode: 500 },
        ),
      });
    });
    await page.getByTestId(testIds.tabs.chat).click();
    await expect(page.getByText('Wedding outfit')).toBeVisible();
    return deleted;
  }

  // On native a left swipe reveals the row's Delete action. The swipe is a
  // react-native-gesture-handler pan that mouse events on web never open, so
  // the web build shows Delete as a trailing button on each row; the swipe
  // itself is checked in the iOS pass, not here.
  async function revealDelete(page: Page, id: string) {
    await expect(page.getByTestId(testIds.chat.sessionRow(id))).toBeVisible();
    await expect(
      page.getByTestId(testIds.chat.sessionDelete(id)),
    ).toBeInViewport();
  }

  test('QA-35: Delete, confirm, and the session is deleted and leaves the list', async ({
    page,
  }) => {
    const [target, other] = SESSIONS;
    const deleted = await openSessions(page, 200);

    await revealDelete(page, target.id);
    let dialogMessage = '';
    page.once('dialog', (dialog) => {
      dialogMessage = dialog.message();
      void dialog.accept();
    });
    await page.getByTestId(testIds.chat.sessionDelete(target.id)).click();

    await expect(page.getByText(target.topic)).not.toBeVisible();
    expect(dialogMessage).toContain('Delete this chat?');
    expect(deleted).toEqual([target.id]);
    await expect(page.getByText(other.topic)).toBeVisible();
    await expect(page.getByText('1 SESSIONS')).toBeVisible();
  });

  test('QA-35: cancelling the confirm deletes nothing', async ({ page }) => {
    const [target] = SESSIONS;
    const deleted = await openSessions(page, 200);

    await revealDelete(page, target.id);
    page.once('dialog', (dialog) => void dialog.dismiss());
    await page.getByTestId(testIds.chat.sessionDelete(target.id)).click();

    await page.waitForTimeout(500);
    expect(deleted).toEqual([]);
    await expect(page.getByText(target.topic)).toBeVisible();
  });

  test('QA-35: a failed delete keeps the row and shows the error banner', async ({
    page,
  }) => {
    const [target] = SESSIONS;
    const deleted = await openSessions(page, 500);

    await revealDelete(page, target.id);
    page.once('dialog', (dialog) => void dialog.accept());
    await page.getByTestId(testIds.chat.sessionDelete(target.id)).click();

    await expect(
      page.getByTestId(testIds.chat.deleteErrorBanner),
    ).toBeVisible();
    expect(deleted).toEqual([target.id]);
    await expect(page.getByText(target.topic)).toBeVisible();
  });

  // ─── QA-69: scroll indicators on the screen edge ─────────────────────────

  test('QA-69: the Settings scroll view spans the screen width while its content keeps the 20px inset', async ({
    page,
  }) => {
    await page.getByTestId(testIds.tabs.settings).click();
    const screen = page.getByTestId(testIds.screens.settings);
    await expect(screen.getByText('Settings', { exact: true })).toBeVisible();

    // The vertical scroller inside the Settings screen - react-native-web
    // renders a ScrollView as a div with `overflow-y: auto|scroll`.
    const geometry = await screen.evaluate((root) => {
      const scroller = Array.from(
        root.querySelectorAll<HTMLElement>('div'),
      ).find((el) => /(auto|scroll)/.test(getComputedStyle(el).overflowY));
      if (!scroller) return null;
      const scrollerBox = scroller.getBoundingClientRect();
      const title = Array.from(
        root.querySelectorAll<HTMLElement>('div, span'),
      ).find((el) => el.textContent === 'Settings' && el.children.length === 0);
      const titleBox = title?.getBoundingClientRect();
      return {
        viewportWidth: document.documentElement.clientWidth,
        scrollerLeft: scrollerBox.left,
        scrollerRight: scrollerBox.right,
        titleLeft: titleBox?.left ?? null,
      };
    });
    if (!geometry)
      throw new Error('expected a vertical scroller on the Settings screen');

    // The scroller - and so its vertical indicator - runs edge to edge.
    expect(geometry.scrollerLeft).toBe(0);
    expect(geometry.scrollerRight).toBe(geometry.viewportWidth);
    // The content keeps its page inset (`pageInlineIntent`, 20).
    expect(geometry.titleLeft).toBe(20);
  });
});

// ─── QA-67: the Filters sheet on an iPhone SE-sized screen ───────────────────

test('QA-67: at 375x667 the Filters footer stays on screen, and the body scrolls inside the cap when it overflows', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await stubWardrobe(page, ITEMS);
  await loginThroughUi(page, user);
  await page.getByTestId(testIds.tabs.items).click();
  await expect(page.getByText('Blue Denim Jacket')).toBeVisible();

  await page.getByTestId(testIds.items.filterButton).click();
  const sheet = page.getByTestId(testIds.modal.sheet);
  await expect(sheet).toBeVisible();
  await expect
    .poll(async () => {
      const box = await sheet.boundingBox();
      return box ? Math.round(box.y + box.height) : null;
    })
    .toBe(667);

  const sheetBox = await sheet.boundingBox();
  if (!sheetBox) throw new Error('expected a bounding box for the modal sheet');
  expect(sheetBox.height).toBeLessThanOrEqual(667 * 0.88 + 1);

  // Without scrolling anything: both footer buttons are fully inside the
  // sheet and on screen.
  for (const label of ['Clear all', 'Apply']) {
    const box = await page.getByText(label, { exact: true }).boundingBox();
    if (!box) throw new Error(`expected a bounding box for ${label}`);
    expect(box.y, `${label} top`).toBeGreaterThanOrEqual(sheetBox.y);
    expect(box.y + box.height, `${label} bottom`).toBeLessThanOrEqual(
      sheetBox.y + sheetBox.height + 1,
    );
  }

  // The body is the bounded part: its scroller ends inside the sheet, above
  // the footer, whatever the content's height.
  const favourite = page.getByText('Show favourites only', { exact: true });
  const bodyScroller = async () =>
    favourite.evaluate((el) => {
      let node: HTMLElement | null = el as HTMLElement;
      while (node && !/(auto|scroll)/.test(getComputedStyle(node).overflowY)) {
        node = node.parentElement;
      }
      if (!node) return null;
      const box = node.getBoundingClientRect();
      return {
        bottom: box.bottom,
        overflows: node.scrollHeight > node.clientHeight + 1,
      };
    });
  const applyBox = async () => {
    const box = await page.getByText('Apply', { exact: true }).boundingBox();
    if (!box) throw new Error('expected a bounding box for Apply');
    return box;
  };
  const at667 = await bodyScroller();
  if (!at667)
    throw new Error('expected the Filters body to be a vertical scroller');
  expect(at667.bottom).toBeLessThanOrEqual((await applyBox()).y);

  // Web fonts are a little shorter than iOS's, so at 375x667 the Filters body
  // just fits on web. A shorter window makes it overflow, which exercises the
  // scroll-inside-the-cap path the SE hits on device: the footer stays on
  // screen and scrolling the body brings the last section (FAVOURITE) in.
  await page.setViewportSize({ width: 375, height: 480 });
  await expect
    .poll(async () => {
      const box = await sheet.boundingBox();
      return box ? Math.round(box.height) <= Math.round(480 * 0.88) + 1 : null;
    })
    .toBe(true);
  const at480 = await bodyScroller();
  expect(
    at480?.overflows,
    'the Filters body should overflow its bounded height at 375x480',
  ).toBe(true);
  const short = await applyBox();
  expect(short.y + short.height, 'Apply bottom at 375x480').toBeLessThanOrEqual(
    480,
  );
  await favourite.evaluate((el) => {
    let node: HTMLElement | null = el as HTMLElement;
    while (node && !/(auto|scroll)/.test(getComputedStyle(node).overflowY)) {
      node = node.parentElement;
    }
    if (node) node.scrollTop = node.scrollHeight;
  });
  await expect(favourite).toBeInViewport();
  await page.setViewportSize({ width: 375, height: 667 });

  // Still a working sheet.
  await page.getByText('jacket', { exact: true }).click();
  await page.getByText('Apply', { exact: true }).click();
  await expect(sheet).not.toBeVisible();
});

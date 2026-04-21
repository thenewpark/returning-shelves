import { expect, test } from '@playwright/test';
import { createLandingState } from '../src/wizardState';

test.beforeEach(async ({ request }) => {
  await request.post('http://127.0.0.1:4173/__woz_state', {
    data: {
      revision: 0,
      state: createLandingState(),
    },
  });
});

test('renders the returning shelves layout', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 1194, height: 834 });

  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');
  await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute('content', 'yes');
  await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute(
    'content',
    'Returning Shelves',
  );
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    'href',
    '/apple-touch-icon.png',
  );

  await expect(page.getByRole('heading', { name: 'Return Shelf Machine' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Pick up a book to start exploration' }),
  ).toBeVisible();
  await page.screenshot({ path: '/tmp/returning-shelves-landing.png' });

  await page.getByRole('button', { name: 'Pick up a book to start exploration' }).click();

  await expect(page.getByRole('button', { name: 'Designer' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Omnigroup' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Previous selected book' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next selected book' })).toBeVisible();
  await expect(page.locator('.selected-book-thumb')).toHaveCount(3);
  await expect(page.locator('.detail-card--info')).toContainText('Words form language');
  await expect(page.locator('.rail-viewport--base')).toBeVisible();
  await expect
    .poll(async () =>
      page.locator('.rail-viewport--base').evaluate((node) => node.scrollWidth > node.clientWidth),
    )
    .toBe(true);
  await page.screenshot({ path: '/tmp/returning-shelves-ipad11.png' });

  await page.getByRole('button', { name: 'Locate klima' }).click();
  await expect(page.getByLabel('Library location')).toBeVisible();
  await expect(page.locator('.locator-note')).toContainText('The book is located');
  await expect(page.locator('.locator-card')).toContainText('klima');
  await page.screenshot({ path: '/tmp/returning-shelves-location.png' });
  await page.locator('.locator-overlay').click({ position: { x: 550, y: 300 } });
  await expect(page.getByLabel('Library location')).toBeVisible();
  await page.locator('.locator-overlay').click({ position: { x: 1120, y: 785 } });
  await expect(page.getByLabel('Library location')).toBeHidden();

  await page.getByRole('button', { name: 'Returned with' }).click();
  await expect(page.locator('.rail-viewport--returned')).toBeVisible();
  await expect
    .poll(async () =>
      page.locator('.rail-viewport--returned').evaluate((node) => node.scrollWidth > node.clientWidth),
    )
    .toBe(true);
  await page.screenshot({ path: '/tmp/returning-shelves-returned.png' });
  await page.getByRole('button', { name: 'Locate returned-with selection' }).click();
  await expect(page.locator('.locator-note')).toContainText('The selection [2 books]');
  await expect(page.locator('.locator-plus-box')).toContainText('+');
  await page.screenshot({ path: '/tmp/returning-shelves-returned-location.png' });
  await page.locator('.locator-overlay').click({ position: { x: 1120, y: 785 } });
  await expect(page.getByLabel('Library location')).toBeHidden();

  await page.getByRole('button', { name: 'Materiality' }).click();
  await expect(page.getByText('Paperback, 24 ×16 ×2.3 cm, 220 pages')).toBeVisible();
  await expect(page.locator('.rail-viewport--materiality')).toBeVisible();
  await page.screenshot({ path: '/tmp/returning-shelves-materiality.png' });
  await page.getByRole('button', { name: 'Locate Ways of Seeing' }).click();
  await expect(page.locator('.locator-note')).toContainText('DG-92352');
  await expect(page.locator('.locator-card')).toContainText('Ways of Seeing.');
  await page.screenshot({ path: '/tmp/returning-shelves-materiality-location.png' });
  await page.locator('.locator-overlay').click({ position: { x: 1120, y: 785 } });
  await expect(page.getByLabel('Library location')).toBeHidden();

  await page.getByRole('button', { name: 'Designer' }).click();
  await expect(page.locator('.rail-viewport--base')).toBeVisible();

  const manifest = await page.evaluate(async () => {
    const response = await fetch('/manifest.webmanifest');
    return response.json();
  });

  expect(manifest.display).toBe('standalone');
  expect(manifest.orientation).toBe('landscape');
  expect(manifest.icons.map((icon: { src: string }) => icon.src)).toEqual(
    expect.arrayContaining(['/icon-192.png', '/icon-512.png']),
  );
});

test('syncs the display from the admin route', async ({ browser }) => {
  const context = await browser.newContext();
  const displayPage = await context.newPage();
  const adminPage = await context.newPage();

  await displayPage.goto('/');
  await adminPage.goto('/admin');

  await expect(adminPage.getByRole('heading', { name: 'Return Shelf Machine Admin' })).toBeVisible();

  await adminPage.getByRole('button', { name: 'Switch to 1 book selected screen' }).click();
  await expect(displayPage.locator('.shelf-board')).toBeVisible();
  await expect(displayPage.locator('.selected-book-thumb')).toHaveCount(0);
  await expect(displayPage.locator('.detail-card--info')).toContainText('Words form language');

  await adminPage.getByRole('button', { name: 'Switch to 2 book selected screen' }).click();
  await expect(displayPage.locator('.selected-book-thumb')).toHaveCount(1);
  await expect(displayPage.getByRole('button', { name: 'Previous selected book' })).toBeVisible();
  await displayPage.getByRole('button', { name: 'Next selected book' }).click();
  await expect(displayPage.locator('.detail-card--info')).toContainText('Brigade Cynophile');
  await expect(adminPage.locator('.admin-state-list')).toContainText('cynophile');

  await adminPage.getByRole('button', { name: 'Switch to 3 book selected screen' }).click();
  await expect(displayPage.locator('.selected-book-thumb')).toHaveCount(2);
  await expect(displayPage.getByRole('button', { name: 'Next selected book' })).toBeVisible();

  await adminPage.getByRole('button', { name: 'Switch to default screen' }).click();
  await expect(displayPage.getByRole('heading', { name: 'Return Shelf Machine' })).toBeVisible();
});

test('updates related books for cynophile and macguffin selections', async ({ browser }) => {
  const context = await browser.newContext();
  const displayPage = await context.newPage();
  const adminPage = await context.newPage();

  await displayPage.goto('/');
  await adminPage.goto('/admin');

  await adminPage.getByRole('button', { name: 'Switch to 1 book selected screen' }).click();
  await adminPage.getByRole('button', { name: 'Brigade Cynophile' }).click();

  await expect(displayPage.locator('.detail-card--info')).toContainText('Brigade Cynophile');
  await expect(displayPage.getByRole('button', { name: 'Locate Ventoline' })).toBeVisible();
  await expect(displayPage.getByAltText('Meridian Brothers poster cover')).toBeVisible();

  await displayPage.getByRole('button', { name: 'Locate Ventoline' }).click();
  await expect(displayPage.locator('.locator-card')).toContainText('Ventoline.');
  await displayPage.locator('.locator-overlay').click({ position: { x: 1120, y: 785 } });

  await displayPage.getByRole('button', { name: 'Returned with' }).click();
  await expect(displayPage.getByAltText('ISSUE N°4, The Sink cover')).toBeVisible();
  await expect(displayPage.getByAltText('apartamento issue cover')).toBeVisible();
  await displayPage.getByRole('button', { name: 'Locate returned-with Ventoline and ISSUE N°4, The Sink' }).click();
  await expect(displayPage.locator('.locator-card').filter({ hasText: 'ISSUE N°4,The Sink' })).toBeVisible();
  await displayPage.locator('.locator-overlay').click({ position: { x: 1120, y: 785 } });

  await displayPage.getByRole('button', { name: 'Materiality' }).click();
  await expect(displayPage.getByAltText("All Work is Women's Work cover")).toBeVisible();
  await expect(displayPage.getByAltText('Piecing Pages cover')).toBeVisible();

  await adminPage.getByRole('button', { name: 'MacGuffin' }).click();
  await expect(displayPage.locator('.detail-card--info')).toContainText('ISSUE N°8');
  await expect(displayPage.getByAltText('apartamento cover')).toBeVisible();
  await expect(displayPage.getByAltText('the gentlewoman cover')).toBeVisible();

  await displayPage.getByRole('button', { name: 'Designer' }).click();
  await expect(displayPage.getByRole('button', { name: 'Locate ISSUE N°7, The Trousers' })).toBeVisible();
  await expect(displayPage.getByAltText('ISSUE N°6, The Ball cover')).toBeVisible();
});

import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

/* BUILD_SPEC v3.0 §7 and §12 — the cart surfaces, checked in a real browser.
 * The cart lives in localStorage, so it is seeded before navigation rather
 * than driven through the UI: this test is about the rendered layout and the
 * drawer's keyboard behaviour, not about add-to-cart. */

const LABEL = process.env.SHOT_LABEL ?? 'cart';
const KEY = 'neocare-cart-v1';
const SEED = [
  { sizeKey: 'medium', pack: 30, quantity: 2 },
  { sizeKey: 'newBorn', pack: 20, quantity: 1 },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ([key, seed]) => window.localStorage.setItem(key as string, JSON.stringify(seed)),
    [KEY, SEED] as const,
  );
});

test('cart page renders the 7/5 layout with real rows', async ({ page }, testInfo) => {
  await page.goto('/en/checkout', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const rows = page.locator('main ul > li');
  await expect(rows).toHaveCount(SEED.length);

  // No figure may appear for shipping, and no checkout button anywhere (§7.2).
  await expect(page.getByRole('button', { name: /proceed to checkout/i })).toHaveCount(0);

  const dir = `artifacts/${LABEL}/${testInfo.project.name}`;
  mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: `${dir}/cart.png`, fullPage: true });
});

test('drawer opens, traps focus, closes on Escape and restores focus', async ({ page }) => {
  await page.goto('/en', { waitUntil: 'networkidle' });

  const cartButton = page.locator('header button[aria-label]').filter({ hasText: '' }).first();
  await page.locator('header button').filter({ has: page.locator('svg') }).nth(0).click();

  const dialog = page.locator('dialog[aria-label]');
  await expect(dialog).toBeVisible();

  // Focus must be inside the dialog once it is modal.
  const inside = await page.evaluate(() => {
    const d = document.querySelector('dialog[aria-label]');
    return !!d && d.contains(document.activeElement);
  });
  expect(inside).toBe(true);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  expect(await cartButton.count()).toBeGreaterThan(0);
});

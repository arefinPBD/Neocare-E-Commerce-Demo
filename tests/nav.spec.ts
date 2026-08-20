import { test, expect } from '@playwright/test';

/**
 * Header dropdown behaviour.
 *
 * Regression guard for a real bug: the header carried an unnamed `group` for
 * its transparent-state contrast switch, and `group-hover:` compiles to
 * `.group:hover &`, which matches ANY `.group` ancestor rather than the
 * nearest one. Each dropdown panel reveals itself with `group-hover:visible`
 * against its own `<li class="group">`, so hovering anywhere in the bar
 * satisfied every panel at once and both dropdowns opened stacked on top of
 * each other. The header's group is named now; this test fails if anyone
 * makes it anonymous again.
 *
 * Desktop only: the nav is `lg:block`, and below that the items live in the
 * <details> disclosure instead.
 */

const DESKTOP_ONLY = 'nav dropdowns only exist at lg and up';

test.describe('header dropdowns', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1280', DESKTOP_ONLY);
    await page.goto('/en', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
  });

  test('no dropdown is open before any hover', async ({ page }) => {
    const open = await visiblePanels(page);
    expect(open, `panels open at rest: ${open.join(', ')}`).toHaveLength(0);
  });

  test('hovering one trigger opens only that dropdown', async ({ page }) => {
    const triggers = page.locator('header nav > ul > li.group');
    const count = await triggers.count();
    expect(count, 'expected the two dropdown triggers').toBeGreaterThanOrEqual(2);

    for (let i = 0; i < count; i += 1) {
      await triggers.nth(i).locator('> a').hover();
      await page.waitForTimeout(250);

      const open = await visiblePanels(page);
      const label = (await triggers.nth(i).locator('> a').textContent())?.trim();
      expect(
        open,
        `hovering "${label}" opened ${open.length} panel(s): ${open.join(' | ')}`,
      ).toHaveLength(1);
      expect(open[0]).toContain(label ?? '');
    }
  });

  test('keyboard focus opens only the focused dropdown', async ({ page }) => {
    const first = page.locator('header nav > ul > li.group > a').first();
    await first.focus();
    await page.waitForTimeout(250);

    const open = await visiblePanels(page);
    expect(open, `focus opened ${open.length} panel(s)`).toHaveLength(1);
  });

  test('open panels do not overlap each other', async ({ page }) => {
    const triggers = page.locator('header nav > ul > li.group > a');
    await triggers.first().hover();
    await page.waitForTimeout(250);

    const boxes = await page.evaluate(() => {
      const out: { x: number; y: number; w: number; h: number }[] = [];
      for (const panel of document.querySelectorAll('header nav li.group > div')) {
        if (getComputedStyle(panel).visibility !== 'visible') continue;
        const b = panel.getBoundingClientRect();
        out.push({ x: b.x, y: b.y, w: b.width, h: b.height });
      }
      return out;
    });

    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i];
        const b = boxes[j];
        const overlaps =
          a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
        expect(overlaps, 'two dropdown panels are overlapping').toBe(false);
      }
    }
  });
});

/** Labels of every dropdown panel currently painted. */
async function visiblePanels(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const out: string[] = [];
    for (const li of document.querySelectorAll('header nav > ul > li.group')) {
      const panel = li.querySelector(':scope > div');
      if (!panel) continue;
      const cs = getComputedStyle(panel);
      if (cs.visibility === 'visible' && parseFloat(cs.opacity) > 0.1) {
        out.push((li.querySelector(':scope > a')?.textContent ?? '').trim());
      }
    }
    return out;
  });
}

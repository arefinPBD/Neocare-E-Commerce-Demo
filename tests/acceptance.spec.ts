import { test, expect, devices } from '@playwright/test';

/* BUILD_SPEC v3.0 §12 — the acceptance criteria that need a real browser.
 * The grep-able ones (no hex outside tokens.css, no new dependency) live in
 * scripts/check-static.mjs, which runs without a server. */

const KEY = 'neocare-cart-v1';
const ONE_ITEM = JSON.stringify([{ sizeKey: 'medium', pack: 30, quantity: 2 }]);

/* ---- §11 / §12: only ONE gallery image is requested at 375px ----------- */
test('PDP requests no feature crops at 375px', async ({ browser }) => {
  const ctx = await browser.newContext({
    ...devices['Pixel 5'],
    viewport: { width: 375, height: 812 },
  });
  const page = await ctx.newPage();

  const productImages: string[] = [];
  page.on('request', (r) => {
    if (r.resourceType() !== 'image') return;
    const url = decodeURIComponent(r.url());
    if (url.includes('/product/')) productImages.push(url);
  });

  await page.goto('/en/product/medium', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const crops = productImages.filter((u) => u.includes('/product/features/'));
  expect(
    crops,
    `feature crops are hidden below lg and must not be fetched on a phone:\n${crops.join('\n')}`,
  ).toHaveLength(0);

  await ctx.close();
});

/* ---- §12: no star rating, review count, or rating figure --------------- */
test('no rating or review affordance anywhere', async ({ page }) => {
  const routes = ['/en', '/en/product/medium', '/en/products', '/en/checkout'];
  for (const path of routes) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const body = (await page.textContent('body')) ?? '';
    expect(body, `${path} mentions reviews`).not.toMatch(/\breviews?\b/i);
    expect(body, `${path} mentions a rating`).not.toMatch(/\brating\b|\bstars?\b/i);
    expect(body, `${path} renders a star glyph`).not.toMatch(/[★☆]/);
  }
});

/* ---- §12: no delivery threshold, shipping cost, discount or tax -------- */
test('no shipping figure, discount or tax row on the cart page', async ({ page }) => {
  await page.addInitScript(
    ([k, v]) => localStorage.setItem(k as string, v as string),
    [KEY, ONE_ITEM] as const,
  );
  await page.goto('/en/checkout', { waitUntil: 'networkidle' });

  const summary = page.locator('section[aria-labelledby="summary-heading"]');
  const text = (await summary.textContent()) ?? '';

  expect(text, 'a tax/VAT row appeared').not.toMatch(/\bVAT\b|\btax\b/i);
  expect(text, 'a discount appeared').not.toMatch(
    /\bdiscount\b|free delivery|free shipping/i,
  );

  // The Shipping row carries a note, never a currency figure.
  const shippingValue =
    (await summary.locator('dl > div').nth(1).locator('dd').textContent()) ?? '';
  expect(
    shippingValue,
    `shipping rendered a figure: ${shippingValue}`,
  ).not.toMatch(/[0-9০-৯]/);
});

/* ---- non-negotiable 6: the cart never implies a transaction ------------ */
test('cart page has no checkout control and no order confirmation', async ({
  page,
}) => {
  await page.goto('/en/checkout', { waitUntil: 'domcontentloaded' });
  const body = (await page.textContent('body')) ?? '';
  expect(body).not.toMatch(
    /order (confirmed|placed|number)|reference number|thank you for your order/i,
  );
  await expect(
    page.getByRole('button', { name: /proceed to checkout|place order|pay now/i }),
  ).toHaveCount(0);
  await expect(page.locator('main form')).toHaveCount(0);
  await expect(page.locator('main input')).toHaveCount(0);
});

/* ---- non-negotiable 4: the navel cutout appears in S9 only ------------- */
test('navel cutout imagery appears only in the New Born section', async ({
  page,
}) => {
  const elsewhere = [
    '/en/product/new-born',
    '/en/product/medium',
    '/en/products',
    '/en/checkout',
  ];
  for (const path of elsewhere) {
    await page.goto(path, { waitUntil: 'networkidle' });
    const srcs = await page.evaluate(() =>
      [...document.querySelectorAll('img')].map((i) =>
        decodeURIComponent(i.currentSrc || i.src),
      ),
    );
    expect(
      srcs.filter((s) => s.includes('cutout-flatlay')),
      `${path} renders the navel cutout`,
    ).toHaveLength(0);
  }
});

/* ---- DESIGN.md §8: no hover transform on a commerce surface ------------ */
test('no hover transform on product cards or chips', async ({ page }) => {
  await page.goto('/en/products', { waitUntil: 'networkidle' });
  const offenders = await page.evaluate(() => {
    const out: string[] = [];
    for (const el of document.querySelectorAll('main a, main button, main img, main span')) {
      const cls = typeof el.className === 'string' ? el.className : '';
      if (/hover:scale|group-hover:scale|hover:-translate|group-hover:-translate/.test(cls)) {
        out.push(`${el.tagName}.${cls}`);
      }
    }
    return out;
  });
  expect(offenders, offenders.join('\n')).toHaveLength(0);
});

/* ---- DESIGN.md §2.3: uppercase is neutralised on /bn ------------------- */
test('uppercase and letter-spacing are neutralised on the Bangla route', async ({
  page,
}) => {
  await page.goto('/bn/product/medium', { waitUntil: 'networkidle' });
  const bad = await page.evaluate(() => {
    const out: string[] = [];
    for (const el of document.querySelectorAll('main *')) {
      const cs = getComputedStyle(el);
      const cls = typeof el.className === 'string' ? el.className : '';
      if (cs.textTransform === 'uppercase') out.push(`uppercase: ${el.tagName}.${cls}`);
      if (cs.letterSpacing !== 'normal' && (el.textContent ?? '').trim()) {
        out.push(`tracking ${cs.letterSpacing}: ${el.tagName}.${cls}`);
      }
    }
    return out;
  });
  expect(bad, bad.join('\n')).toHaveLength(0);

  // And it IS applied on /en, or the chips are not following §6.4 at all.
  await page.goto('/en/product/medium', { waitUntil: 'networkidle' });
  const upper = await page.evaluate(
    () =>
      [...document.querySelectorAll('main *')].filter(
        (el) => getComputedStyle(el).textTransform === 'uppercase',
      ).length,
  );
  expect(upper, 'no uppercase chip on /en').toBeGreaterThan(0);
});

/* ---- §12: prefers-reduced-motion animates nothing ---------------------- */
test('reduced motion renders end states and animates nothing', async ({
  browser,
}) => {
  const ctx = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 900 },
  });
  const page = await ctx.newPage();
  await page.addInitScript(
    ([k, v]) => localStorage.setItem(k as string, v as string),
    [KEY, ONE_ITEM] as const,
  );
  await page.goto('/en/checkout', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const running = await page.evaluate(
    () => document.getAnimations().filter((a) => a.playState === 'running').length,
  );
  expect(running, 'animations still running under reduced motion').toBe(0);

  // The cart row must be at its end state, not stuck mid-fade.
  const opacity = await page.evaluate(() => {
    const li = document.querySelector('main ul > li');
    return li ? getComputedStyle(li).opacity : '1';
  });
  expect(Number(opacity)).toBe(1);

  await ctx.close();
});

/* ---- §12: both locales render, pending markers visible ---------------- */
test('both locales render and pending markers are visible', async ({ page }) => {
  for (const locale of ['en', 'bn']) {
    await page.goto(`/${locale}/product/medium`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    const body = (await page.textContent('body')) ?? '';
    expect(body, `${locale} should surface its pending markers`).toContain(
      '[TODO: client]',
    );
  }
});

/* ---- §12: keyboard traversal ------------------------------------------ */
test('keyboard reaches the pack radios and every control shows focus', async ({
  page,
}) => {
  await page.goto('/en/product/medium', { waitUntil: 'networkidle' });

  // Radios are reachable, and arrow keys move the selection for free because
  // they are native radios in a fieldset (§2).
  const first = page.locator('input[type=radio]').first();
  await first.focus();
  await expect(first).toBeFocused();
  await page.keyboard.press('ArrowRight');
  const checked = await page.evaluate(
    () =>
      (document.querySelector('input[type=radio]:checked') as HTMLInputElement)
        ?.value,
  );
  expect(checked, 'arrow key did not move the pack selection').toBe('50');

  /* Every interactive element has a visible focus indicator (§10).
   *
   * Only VISIBLE elements are checked. Calling .focus() on a display:none
   * node does not focus it, so its resting style comes back and every hidden
   * control reads as a failure — which drowns out the real ones. The mobile
   * disclosure's links are display:none at 1280px and are covered by the
   * mobile project instead. */
  const noRing = await page.evaluate(() => {
    const out: string[] = [];
    for (const el of document.querySelectorAll(
      'a[href], button, input, [tabindex="0"]',
    )) {
      const node = el as HTMLElement;
      if (!node.offsetParent && getComputedStyle(node).position !== 'fixed') continue;
      node.focus();
      if (document.activeElement !== node) continue;
      const cs = getComputedStyle(node);
      const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
      const ring = cs.boxShadow !== 'none';
      const cls = typeof node.className === 'string' ? node.className : '';
      if (!outline && !ring) out.push(`${node.tagName}.${cls}`);
    }
    return out;
  });
  expect(noRing, `no focus indicator on:\n${noRing.join('\n')}`).toHaveLength(0);
});

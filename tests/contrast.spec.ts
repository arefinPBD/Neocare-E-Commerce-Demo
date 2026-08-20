import { test, expect } from '@playwright/test';

/**
 * BUILD_SPEC v3.0 §10 — "Contrast: sample real rendered pixels", not the token
 * table. Three cases are named there. This measures all three.
 *
 * The header-over-hero case is the one §10 calls the risk: --nc-ink-500 over a
 * 45%-opacity photograph is not the same measurement as --nc-ink-500 on white,
 * and the token table only ever quotes the latter.
 *
 * Method for that case: hide everything the header draws, screenshot the strip
 * it occupies, and read that PNG back into a canvas inside the page so its
 * pixels can be inspected without adding a decoder dependency. What is left in
 * the strip is exactly the background the text sits on, composited by the
 * browser rather than by arithmetic here. The WORST pixel in that strip is the
 * one reported: if it clears AA, every pixel does.
 */

type Rgb = [number, number, number];

const parseRgb = (css: string): Rgb => {
  const m = css.match(/rgba?\(([^)]+)\)/);
  if (!m) throw new Error(`cannot parse colour: ${css}`);
  const [r, g, b] = m[1].split(',').map((n) => parseFloat(n));
  return [r, g, b];
};

const luminance = ([r, g, b]: Rgb) => {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const ratio = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/* ---- Case 1: the promo bar -------------------------------------------- */
test('promo bar contrast', async ({ page }) => {
  await page.goto('/en', { waitUntil: 'networkidle' });

  const bar = page.locator('body > div.bg-green-900').first();
  const count = await bar.count();

  if (count === 0) {
    /* Expected. promo.text ships empty and §5.1 says to render nothing at
     * all rather than an empty band. There is no rendered pixel to sample.
     * The moment the client supplies copy this assertion starts measuring. */
    test.info().annotations.push({
      type: 'not applicable',
      description:
        'promo.text is empty, so §5.1 renders no band. Re-run this once the client supplies promo copy.',
    });
    expect(count).toBe(0);
    return;
  }

  const { fg, bg } = await bar.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { fg: cs.color, bg: cs.backgroundColor };
  });
  expect(ratio(parseRgb(fg), parseRgb(bg))).toBeGreaterThanOrEqual(4.5);
});

/* ---- Case 2: muted text inside the order-summary panel ----------------- */
test('order summary muted text on bg-surface-brand', async ({ page }) => {
  await page.addInitScript(
    ([k, v]) => localStorage.setItem(k as string, v as string),
    ['neocare-cart-v1', JSON.stringify([{ sizeKey: 'medium', pack: 30, quantity: 1 }])] as const,
  );
  await page.goto('/en/checkout', { waitUntil: 'networkidle' });

  const measured = await page
    .locator('section[aria-labelledby="summary-heading"]')
    .evaluate((panel) => {
      const bg = getComputedStyle(panel).backgroundColor;
      const out: { text: string; fg: string; bg: string }[] = [];
      for (const el of panel.querySelectorAll('p, dt, dd, h2, a')) {
        const t = (el.textContent ?? '').trim();
        if (!t) continue;
        out.push({ text: t.slice(0, 40), fg: getComputedStyle(el).color, bg });
      }
      return out;
    });

  expect(measured.length).toBeGreaterThan(0);
  for (const m of measured) {
    const r = ratio(parseRgb(m.fg), parseRgb(m.bg));
    expect(r, `"${m.text}" measured ${r.toFixed(2)}:1 on the panel`).toBeGreaterThanOrEqual(4.5);
  }
});

/* ---- Case 3: header nav over the hero, transparent state --------------
 *
 * Measured from the ACTUAL painted strip, not from a guess about which part
 * of the photograph the header overlaps. The header's own text and logo are
 * hidden, the strip is screenshotted, and the PNG is read back into a canvas
 * in the page so its pixels can be inspected without a decoder dependency.
 * What is left in that strip is exactly the background the text sits on:
 * the section colour, the photograph, and its opacity, composited by the
 * browser rather than by arithmetic in this file.
 */
test('header nav text over the hero photograph', async ({ page }) => {
  await page.goto('/en', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  // The colours the header paints in its transparent-over-hero state.
  const probes = await page.evaluate(() => {
    const header = document.querySelector('header') as HTMLElement;
    const out: { label: string; color: string }[] = [];
    const navLink = header.querySelector('nav a');
    if (navLink) out.push({ label: 'nav link', color: getComputedStyle(navLink).color });
    const cartCount = header.querySelector('button span:not([aria-hidden])');
    if (cartCount) out.push({ label: 'cart count', color: getComputedStyle(cartCount).color });
    const cartGlyph = header.querySelector('button svg');
    if (cartGlyph) out.push({ label: 'cart glyph', color: getComputedStyle(cartGlyph).color });
    const toggle = header.querySelector('a[hreflang]');
    if (toggle) out.push({ label: 'lang toggle', color: getComputedStyle(toggle).color });
    return out;
  });

  const box = await page.locator('header').boundingBox();
  expect(box).not.toBeNull();

  // Hide everything the header draws, leaving only what is behind it.
  await page.addStyleTag({
    content: 'header a, header nav, header button, header span, header img, header svg { visibility: hidden !important }',
  });
  const shot = await page.screenshot({
    clip: { x: box!.x, y: box!.y, width: box!.width, height: box!.height },
  });

  const bgPixels = await page.evaluate(async (b64: string) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const cv = document.createElement('canvas');
    cv.width = img.width;
    cv.height = img.height;
    const ctx = cv.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    const lum = (r: number, g: number, bl: number) => {
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
    };
    let darkest = [255, 255, 255];
    let lightest = [0, 0, 0];
    let minL = 2;
    let maxL = -1;
    for (let i = 0; i < d.length; i += 4) {
      const l = lum(d[i], d[i + 1], d[i + 2]);
      if (l < minL) { minL = l; darkest = [d[i], d[i + 1], d[i + 2]]; }
      if (l > maxL) { maxL = l; lightest = [d[i], d[i + 1], d[i + 2]]; }
    }
    return { darkest, lightest, w: cv.width, h: cv.height };
  }, shot.toString('base64'));

  const failures: string[] = [];
  for (const probe of probes) {
    const fg = parseRgb(probe.color);
    const vsDark = ratio(fg, bgPixels.darkest as Rgb);
    const vsLight = ratio(fg, bgPixels.lightest as Rgb);
    const worst = Math.min(vsDark, vsLight);
    // eslint-disable-next-line no-console
    console.log(
      `  ${probe.label.padEnd(11)} ${probe.color.padEnd(20)} worst ${worst.toFixed(2)}:1 ` +
        `(darkest bg rgb(${bgPixels.darkest.join(',')}) ${vsDark.toFixed(2)}, ` +
        `lightest rgb(${bgPixels.lightest.join(',')}) ${vsLight.toFixed(2)})`,
    );
    if (worst < 4.5) failures.push(`${probe.label}: ${worst.toFixed(2)}:1 (needs 4.5:1)`);
  }

  expect(failures, failures.join(' | ')).toHaveLength(0);
});

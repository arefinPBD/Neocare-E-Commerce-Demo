import { test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

/* BUILD_SPEC v3.0 §11 — performance gates.
 *
 * Next 16 builds with Turbopack and no longer emits an app-build-manifest, and
 * its build output prints no per-route sizes. So measure the thing the budget
 * actually describes: what the browser really downloads on a cold load.
 *
 * Sizes come from request.sizes().responseBodySize, which is the ENCODED body
 * (i.e. post-gzip, as `next start` serves it). response.body() would return the
 * decoded bytes and overstate JS by roughly 3x against a gzipped budget.
 *
 * Budgets: JS ≤ 180 KB gz · hero ≤ 180 KB · total first view ≤ 1.2 MB. */

const LABEL = process.env.SHOT_LABEL ?? 'baseline';

const BUDGET = {
  js: 180 * 1024,
  image: 180 * 1024,
  total: 1.2 * 1024 * 1024,
};

const ROUTES = [
  ['home', ''],
  ['pdp', '/product/medium'],
  ['checkout', '/checkout'],
] as const;

type Row = {
  project: string;
  route: string;
  js: number;
  css: number;
  font: number;
  image: number;
  imageCount: number;
  largestImage: { url: string; bytes: number } | null;
  total: number;
};

const rows: Row[] = [];

for (const [name, path] of ROUTES) {
  test(`budget ${name}`, async ({ page }, testInfo) => {
    const seen = new Map<string, { type: string; bytes: number }>();

    page.on('response', async (res) => {
      const url = res.url();
      if (seen.has(url)) return;
      const type = res.request().resourceType();
      if (!['script', 'stylesheet', 'font', 'image', 'document'].includes(type)) return;
      let bytes = 0;
      try {
        bytes = (await res.request().sizes()).responseBodySize;
      } catch {
        return;
      }
      if (bytes <= 0) return;
      seen.set(url, { type, bytes });
    });

    await page.goto(`/en${path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Let any lazy/idle work settle before we take the reading.
    await page.waitForTimeout(1500);

    const sum = (t: string) =>
      [...seen.values()].filter((v) => v.type === t).reduce((a, v) => a + v.bytes, 0);

    const images = [...seen.entries()].filter(([, v]) => v.type === 'image');
    const largest = images.sort((a, b) => b[1].bytes - a[1].bytes)[0];

    rows.push({
      project: testInfo.project.name,
      route: name,
      js: sum('script'),
      css: sum('stylesheet'),
      font: sum('font'),
      image: sum('image'),
      imageCount: images.length,
      largestImage: largest ? { url: largest[0], bytes: largest[1].bytes } : null,
      total: [...seen.values()].reduce((a, v) => a + v.bytes, 0),
    });
  });
}

test.afterAll(() => {
  // One file per project; see the note in baseline.spec.ts.
  const project = rows[0]?.project ?? 'unknown';
  mkdirSync(`artifacts/${LABEL}`, { recursive: true });
  writeFileSync(
    `artifacts/${LABEL}/budget-${project}.json`,
    JSON.stringify(rows, null, 2),
  );

  const kb = (n: number) => (n / 1024).toFixed(1).padStart(8) + ' KB';
  const flag = (n: number, b: number) => (n > b ? ' OVER' : '');
  /* eslint-disable no-console */
  console.log(
    '\n' +
      'project'.padEnd(14) +
      'route'.padEnd(10) +
      'js'.padStart(11) +
      'css'.padStart(11) +
      'font'.padStart(11) +
      'img'.padStart(11) +
      '#img'.padStart(6) +
      'total'.padStart(12),
  );
  for (const r of rows) {
    console.log(
      r.project.padEnd(14) +
        r.route.padEnd(10) +
        kb(r.js) +
        kb(r.css) +
        kb(r.font) +
        kb(r.image) +
        String(r.imageCount).padStart(6) +
        kb(r.total) +
        flag(r.js, BUDGET.js) +
        flag(r.total, BUDGET.total),
    );
    if (r.largestImage) {
      console.log(
        '  largest image: ' +
          r.largestImage.url.split('/').pop() +
          ' ' +
          (r.largestImage.bytes / 1024).toFixed(1) +
          ' KB' +
          flag(r.largestImage.bytes, BUDGET.image),
      );
    }
  }
});

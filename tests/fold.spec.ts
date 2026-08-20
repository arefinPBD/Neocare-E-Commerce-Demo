import { test } from '@playwright/test';
import { mkdirSync } from 'node:fs';

/* Viewport-only captures: the fold is where the header/hero relationship is
 * legible. Full-page shots are too tall to read at a glance. */
const LABEL = process.env.SHOT_LABEL ?? 'fold';
const ROUTES = (process.env.FOLD_ROUTES ?? ',/products,/product/medium,/checkout').split(',');

for (const path of ROUTES) {
  const name = path === '' ? 'home' : path.replace(/\//g, '-').replace(/^-/, '');
  test(`fold ${name}`, async ({ page }, testInfo) => {
    await page.goto(`/en${path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const dir = `artifacts/${LABEL}/${testInfo.project.name}`;
    mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: `${dir}/${name}.png` });
  });
}

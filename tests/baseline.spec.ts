import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

/* Task 0 — capture the v2.1 state before any v3.0 work, so every later change
 * has something to be compared against. Writes to artifacts/<LABEL>/. */

const LABEL = process.env.SHOT_LABEL ?? 'baseline';
const ROUTES = [
  ['home', ''],
  ['products', '/products'],
  ['pdp', '/product/medium'],
  ['checkout', '/checkout'],
  ['category', '/category/adult-diapers'],
] as const;

type Metric = {
  project: string;
  locale: string;
  route: string;
  scrollPx: number;
  viewportPx: number;
  scrollVh: number;
  headerPx: number | null;
  imgRequests: number;
};

const metrics: Metric[] = [];

for (const locale of ['en', 'bn']) {
  for (const [name, path] of ROUTES) {
    test(`${locale} ${name}`, async ({ page }, testInfo) => {
      const imgRequests = new Set<string>();
      page.on('request', (r) => {
        if (r.resourceType() === 'image') imgRequests.add(r.url());
      });

      await page.goto(`/${locale}${path}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);

      const dir = `artifacts/${LABEL}/${testInfo.project.name}`;
      mkdirSync(dir, { recursive: true });
      await page.screenshot({
        path: `${dir}/${locale}-${name}.png`,
        fullPage: true,
      });

      const m = await page.evaluate(() => {
        const header = document.querySelector('header');
        return {
          scrollPx: document.documentElement.scrollHeight,
          viewportPx: window.innerHeight,
          headerPx: header ? Math.round(header.getBoundingClientRect().height) : null,
        };
      });

      metrics.push({
        project: testInfo.project.name,
        locale,
        route: name,
        scrollPx: m.scrollPx,
        viewportPx: m.viewportPx,
        scrollVh: Math.round((m.scrollPx / m.viewportPx) * 100),
        headerPx: m.headerPx,
        imgRequests: imgRequests.size,
      });

      expect(page.locator('main, body')).toBeTruthy();
    });
  }
}

test.afterAll(() => {
  /* Each Playwright project runs in its own worker process, so a single shared
   * metrics.json would be overwritten by whichever project finished last.
   * One file per project instead. */
  const project = metrics[0]?.project ?? 'unknown';
  mkdirSync(`artifacts/${LABEL}`, { recursive: true });
  writeFileSync(
    `artifacts/${LABEL}/metrics-${project}.json`,
    JSON.stringify(metrics, null, 2),
  );
  for (const m of metrics) {
    // eslint-disable-next-line no-console
    console.log(
      `${m.project.padEnd(13)} ${m.locale} ${m.route.padEnd(9)} ` +
        `scroll=${String(m.scrollVh).padStart(4)}vh header=${m.headerPx}px images=${m.imgRequests}`,
    );
  }
});

import { test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

/* BUILD_SPEC v3.0 §5.4 — "Scroll budget still ≤ 900vh."
 *
 * The baseline measured 1074vh (mobile) to 1410vh (bn desktop), so the gate is
 * already failing. This test attributes the height section by section, so any
 * cut is made against measured numbers rather than a guess about which section
 * is expensive.
 *
 * It scrolls the whole page before measuring: lazy images and the pinned
 * ProductSequence spacer only take their real height once they have been
 * reached. */

const LABEL = process.env.SHOT_LABEL ?? 'baseline';

type Row = {
  project: string;
  locale: string;
  section: string;
  px: number;
  vh: number;
  pctOfPage: number;
};

const rows: Row[] = [];
const totals: { project: string; locale: string; px: number; vh: number }[] = [];

for (const locale of ['en', 'bn']) {
  test(`scroll budget ${locale}`, async ({ page }, testInfo) => {
    await page.goto(`/${locale}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    // Walk the page so lazy content mounts and the pin spacer settles.
    await page.evaluate(async () => {
      const step = window.innerHeight;
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 400));
    });
    await page.waitForLoadState('networkidle');

    const data = await page.evaluate(() => {
      const vh = window.innerHeight;
      const out: { section: string; px: number }[] = [];
      // Direct children of <main> are the sections, plus the ProductSequence
      // wrapper which owns the pin spacer.
      const main = document.querySelector('main');
      if (main) {
        for (const el of Array.from(main.children)) {
          const h = (el as HTMLElement).getBoundingClientRect().height;
          const id =
            el.id ||
            el.querySelector('[id]')?.id ||
            el.tagName.toLowerCase();
          out.push({ section: id, px: Math.round(h) });
        }
      }
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      if (header) out.unshift({ section: 'header', px: Math.round(header.getBoundingClientRect().height) });
      if (footer) out.push({ section: 'footer', px: Math.round(footer.getBoundingClientRect().height) });
      return { vh, total: document.documentElement.scrollHeight, out };
    });

    for (const s of data.out) {
      rows.push({
        project: testInfo.project.name,
        locale,
        section: s.section,
        px: s.px,
        vh: Math.round((s.px / data.vh) * 100),
        pctOfPage: Math.round((s.px / data.total) * 100),
      });
    }
    totals.push({
      project: testInfo.project.name,
      locale,
      px: data.total,
      vh: Math.round((data.total / data.vh) * 100),
    });
  });
}

test.afterAll(() => {
  const project = rows[0]?.project ?? 'unknown';
  mkdirSync(`artifacts/${LABEL}`, { recursive: true });
  writeFileSync(
    `artifacts/${LABEL}/scroll-${project}.json`,
    JSON.stringify({ rows, totals }, null, 2),
  );
  /* eslint-disable no-console */
  console.log('');
  for (const t of totals) {
    console.log(
      `${t.project} ${t.locale}  TOTAL ${t.vh}vh (${t.px}px)  ` +
        (t.vh > 900 ? `OVER by ${t.vh - 900}vh` : 'ok'),
    );
    for (const r of rows.filter((r) => r.locale === t.locale)) {
      console.log(
        '   ' +
          r.section.padEnd(20) +
          String(r.vh).padStart(5) +
          'vh ' +
          String(r.px).padStart(7) +
          'px ' +
          String(r.pctOfPage).padStart(3) +
          '%',
      );
    }
  }
});

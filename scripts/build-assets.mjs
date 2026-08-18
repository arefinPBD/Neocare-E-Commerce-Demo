/**
 * Asset pipeline. Run: node scripts/build-assets.mjs
 *
 * Source of truth for what may appear on the page:
 *
 *   REAL product photography (may carry product claims)
 *     Diaper 34 Mockup-02.jpg   branded M SKU, angle view -> hero-frame + all feature crops
 *     Medium_50pcs_01.png       pack render
 *     Medium_30pcs_02.png       pack render
 *
 *   GENERATED, no product claim (atmosphere only)
 *     hero_desktop_a1.jpg / hero_mobile_a2.jpg   S1
 *     lifestyle_parent_baby_e1.jpg               S9 supporting
 *     abstract_texture_e2.jpg                    decorative band
 *
 *   EXCLUDED — build spec §1 non-negotiable 3
 *     INTERNAL-BRIEF__do-not-publish__sap_c1.jpg  marked do-not-publish; AI SAP core
 *     product_angle_b1.jpg                        unbranded AI diaper
 *     S1 Opt 2.png                                social-page comp, not a web asset
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { statSync } from 'node:fs';
import path from 'node:path';

const SRC = path.resolve('../Media');
const OUT = path.resolve('public');
const src = (f) => path.join(SRC, f);

const MOCKUP = 'Diaper 34 Mockup-02.jpg';

// Crop windows measured against Diaper 34 Mockup-02.jpg at its native 2388 x 2120.
// Each frames the real part the copy describes. Percentages are meaningless on a
// rotating object (build spec §5.2) but these are a fixed still, so pixels are fine.
const FEATURE_CROPS = {
  sap: { left: 300, top: 600, width: 980, height: 700 },
  cuff: { left: 1120, top: 1060, width: 820, height: 660 },
  ear: { left: 520, top: 250, width: 940, height: 640 },
  velcro: { left: 1580, top: 460, width: 800, height: 620 },
  backsheet: { left: 330, top: 950, width: 880, height: 700 },
};

const written = [];

async function emit(pipeline, rel, { webp = {}, avif = null } = {}) {
  const abs = path.join(OUT, rel);
  await mkdir(path.dirname(abs), { recursive: true });
  await pipeline.clone().webp({ quality: 78, effort: 6, ...webp }).toFile(abs);
  written.push(rel);
  if (avif) {
    const a = abs.replace(/\.webp$/, '.avif');
    await pipeline.clone().avif({ quality: 55, effort: 5, ...avif }).toFile(a);
    written.push(path.relative(OUT, a).replaceAll('\\', '/'));
  }
}

async function main() {
  // ---- S1 hero. Budget: <= 180 KB each (build spec §9). ----
  await emit(sharp(src('hero_desktop_a1.jpg')).resize(1920, 1072, { fit: 'cover' }), 'hero/hero-desktop.webp', {
    webp: { quality: 72 },
    avif: { quality: 48 },
  });
  await emit(sharp(src('hero_mobile_a2.jpg')).resize(828, 1484, { fit: 'cover' }), 'hero/hero-mobile.webp', {
    webp: { quality: 72 },
    avif: { quality: 48 },
  });

  // ---- Product cutout. Doubles as the turntable fallback until frames are shot. ----
  const trimmed = sharp(src(MOCKUP)).trim({ threshold: 12 });
  await emit(trimmed.resize(1400, null, { fit: 'inside' }).flatten({ background: '#ffffff' }), 'product/hero-frame.webp', {
    webp: { quality: 82 },
    avif: { quality: 60 },
  });
  // Mobile-sized variant so the turntable's static fallback does not ship a
  // 1400px image to a 375px screen (the fallback is a plain <img>, so it needs
  // a real srcset rather than next/image's generated one).
  await emit(trimmed.resize(720, null, { fit: 'inside' }).flatten({ background: '#ffffff' }), 'product/hero-frame-720.webp', {
    webp: { quality: 82 },
  });

  // ---- S4-S8 feature crops, real product only. ----
  for (const [key, box] of Object.entries(FEATURE_CROPS)) {
    await emit(
      sharp(src(MOCKUP)).extract(box).resize(720, 560, { fit: 'cover' }).flatten({ background: '#ffffff' }),
      `product/features/${key}.webp`,
      { webp: { quality: 80 } },
    );
  }

  // ---- S9 supporting lifestyle. No product claim: baby is not in a NeoCare diaper. ----
  await emit(sharp(src('lifestyle_parent_baby_e1.jpg')).resize(1120, 750, { fit: 'cover' }), 'newborn/newborn-lifestyle.webp', {
    webp: { quality: 74 },
  });

  // ---- S9 umbilical cutout. ----
  await emit(sharp(src('navel_cutout_d1.jpg')).resize(1120, 836, { fit: 'cover' }), 'newborn/cutout-flatlay.webp', {
    webp: { quality: 80 },
    avif: { quality: 60 },
  });

  // ---- S9 print designs gallery. ----
  const PRINTS = [
    { src: 'Disposable_diaper_with_print_202608181219.jpeg', out: 'print-01' },
    { src: 'Disposable_diaper_with_Bugs_Bunny_202608181218.jpeg', out: 'print-02' },
    { src: 'Disposable_diaper_with_cartoon_p…_202608181217.jpeg', out: 'print-03' },
    { src: 'Disposable_diaper_with_print_202608181217.jpeg', out: 'print-04' },
    { src: 'White_disposable_diaper_with_print_202608181217.jpeg', out: 'print-05' },
    { src: 'White_disposable_diaper_with_print_202608181217 (1).jpeg', out: 'print-06' },
  ];

  for (const item of PRINTS) {
    await emit(
      sharp(src(item.src)).resize(720, 560, { fit: 'cover' }),
      `product/prints/${item.out}.webp`,
      { webp: { quality: 80 } },
    );
  }

  // ---- S10 pack renders. ----
  await emit(sharp(src('Medium_50pcs_01.png')).resize(720, null, { fit: 'inside' }).flatten({ background: '#ffffff' }), 'product/packs/medium-50.webp', {
    webp: { quality: 80 },
  });
  await emit(sharp(src('Medium_30pcs_02.png')).resize(720, null, { fit: 'inside' }).flatten({ background: '#ffffff' }), 'product/packs/medium-30.webp', {
    webp: { quality: 80 },
  });

  // ---- Decorative texture. alt="" everywhere it is used. ----
  await emit(sharp(src('abstract_texture_e2.jpg')).resize(1376, 400, { fit: 'cover' }), 'decor/texture.webp', {
    webp: { quality: 68 },
  });

  const rows = written
    .map((r) => [r, statSync(path.join(OUT, r)).size])
    .sort((a, b) => b[1] - a[1]);
  const report = rows.map(([r, s]) => `${(s / 1024).toFixed(1).padStart(8)} KB  ${r}`).join('\n');
  console.log(report);
  console.log(`\ntotal ${(rows.reduce((n, [, s]) => n + s, 0) / 1024).toFixed(1)} KB`);
  await writeFile(path.join(OUT, 'ASSET_MANIFEST.txt'), report + '\n');

  const over = rows.filter(([r, s]) => r.startsWith('hero/') && r.endsWith('.webp') && s > 180 * 1024);
  if (over.length) {
    console.error('\nFAIL: hero over 180 KB budget:', over);
    process.exit(1);
  }
}

main();

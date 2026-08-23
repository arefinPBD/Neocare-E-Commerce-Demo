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
 *   REAL packshot photography (v3.1) — studio pack renders, transparent PNG
 *     NeBorn / premium-Small / premium-medium / premium-large / premium-XL
 *                                              -> product/packs/{size}.webp
 *     Aspire adult diaper, pant, underpads, wet towel
 *                                              -> product/adult/*.webp
 *     NeoCare baby wipes 80 / 120 / 180        -> product/wipes/*.webp
 *     Lumera makeup-remover, Viva refreshing   -> product/face/*.webp
 *     Alpha is PRESERVED on these (no flatten): the card sits them on
 *     --color-surface-alt, and a baked white box would show as a hard square.
 *
 *   EXCLUDED — build spec §1 non-negotiable 3
 *     INTERNAL-BRIEF__do-not-publish__sap_c1.jpg  marked do-not-publish; AI SAP core
 *     product_angle_b1.jpg                        unbranded AI diaper
 *     S1 Opt 2.png                                social-page comp, not a web asset
 *
 *   EXCLUDED — duplicate of a product already emitted (build spec §4.3)
 *     *' (1)'.png                          byte-identical copies (5 files)
 *     NeoCare Baby Diaper Sizes S M L XL.png   Small 32 pcs; no 32-pack variant
 *                                              exists in the catalogue (§4.3)
 *     Medium_50pcs_01 / Medium_30pcs_02        kept, but as the Medium PDP
 *                                              gallery only — the card and the
 *                                              size finder use the studio
 *                                              packshot so all five sizes match
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

  // ---- v3.1 packshots. One per unique product (build spec §4.3). ----
  // Native size is 300x300 (a few 330x300); they are NOT upscaled — an
  // upscaled 300px source looks worse than a sharp small one letterboxed by
  // object-contain, and the card pads it by p-8 anyway. Intrinsic sizes are
  // declared in catalogue.ts so the box never shifts on load.
  const PACKSHOTS = [
    // Diapers Line — the studio family. All five sizes, one consistent look.
    ['NeBorn-300x300-1.png', 'product/packs/new-born'],
    ['premium-Small_50pcs-300x300-1.png', 'product/packs/small'],
    ['premium-medium_50pcs-300x300-1.png', 'product/packs/medium'],
    ['premium-large_50pcs-300x300-1.png', 'product/packs/large'],
    ['premium-XL_50pcs-300x300-1.png', 'product/packs/xl'],

    // Adult Diapers.
    ['AspireAdultDiaper-M-8pcs-1.png', 'product/adult/diaper-m'],
    ['adult-diaper-home-thumb.png', 'product/adult/diaper-m-alt'],
    ['aspire_L_8pcs.png', 'product/adult/diaper-l'],
    ['aspire_pant_medium_8_s.png', 'product/adult/pant-m'],
    ['aspire_pant_large_8_s.png', 'product/adult/pant-l'],
    ['aspire-underpads-premium-300x300-1.png', 'product/adult/underpads'],

    // Baby Wipes (+ the adult wet towel, filed here by product form).
    ['neocare_wipes_80pcs.png', 'product/wipes/baby-80'],
    ['neocare-baby-wipes-cat.png', 'product/wipes/baby-120'],
    ['Baby-Wipes-120pcs-300x300-2.png', 'product/wipes/baby-120-alt'],
    ['neocare-wipes-180s-canister-pack.png', 'product/wipes/baby-180'],
    ['aspire-adult-wet-wipes-300x300-1.png', 'product/wipes/adult-wet-towel'],

    // Face Wipes.
    ['lumera-makeup-remover-wipes-300x300-1.png', 'product/face/makeup-remover'],
    ['viva-refreshing-300x300-1.png', 'product/face/refreshing'],
    ['viva-refreshing-wipes.png', 'product/face/refreshing-alt'],
  ];

  for (const [file, out] of PACKSHOTS) {
    await emit(sharp(src(file)), `${out}.webp`, { webp: { quality: 82, alphaQuality: 100 } });
  }

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

/**
 * BUILD_SPEC v3.0 §12 — the acceptance criteria that are checkable without a
 * browser. Run with `node scripts/check-static.mjs`; exits non-zero on any
 * failure so it can gate CI later.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';

let failures = 0;
const fail = (name, detail) => {
  failures += 1;
  console.log(`FAIL  ${name}`);
  for (const line of String(detail).split('\n')) console.log(`        ${line}`);
};
const pass = (name, note = '') => console.log(`ok    ${name}${note ? `  (${note})` : ''}`);

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};

const srcFiles = walk('src');
const codeFiles = srcFiles.filter((f) => ['.ts', '.tsx'].includes(extname(f)));
const cssFiles = srcFiles.filter((f) => extname(f) === '.css');

/* ---- §12: no hardcoded hex outside tokens.css ------------------------- */
{
  const offenders = [];
  for (const f of [...codeFiles, ...cssFiles]) {
    if (f.endsWith('tokens.css')) continue;
    const lines = readFileSync(f, 'utf8').split('\n');
    lines.forEach((line, i) => {
      // Ignore hex inside a comment: those are references to token values.
      const code = line.replace(/\/\*.*?\*\//g, '').replace(/^\s*\*.*$/, '').replace(/\/\/.*$/, '');
      const m = code.match(/#[0-9a-fA-F]{3,8}\b/g);
      if (m) offenders.push(`${f}:${i + 1}  ${m.join(' ')}  ${line.trim().slice(0, 70)}`);
    });
  }
  if (offenders.length) fail('no hardcoded hex outside tokens.css', offenders.join('\n'));
  else pass('no hardcoded hex outside tokens.css');
}

/* ---- §2 / §12: no new runtime dependency ------------------------------ */
{
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const allowed = new Set(['gsap', 'lenis', 'next', 'react', 'react-dom']);
  const banned = ['@headlessui/react', 'motion', 'framer-motion', 'clsx', '@heroicons/react'];

  const extra = Object.keys(pkg.dependencies ?? {}).filter((d) => !allowed.has(d));
  const bannedFound = banned.filter(
    (b) => pkg.dependencies?.[b] || pkg.devDependencies?.[b],
  );

  if (extra.length) fail('no new runtime dependency', `unexpected: ${extra.join(', ')}`);
  else if (bannedFound.length)
    fail('reference-kit dependencies must not ship', bannedFound.join(', '));
  else pass('no new runtime dependency', `${allowed.size} deps, unchanged`);
}

/* ---- §9 / CLAUDE.md: en and bn key parity ----------------------------- */
{
  const flat = (o, pre = '') =>
    Object.entries(o).flatMap(([k, v]) =>
      v && typeof v === 'object' && !Array.isArray(v)
        ? flat(v, `${pre}${k}.`)
        : [`${pre}${k}`],
    );
  const en = flat(JSON.parse(readFileSync('src/content/en.json', 'utf8')));
  const bn = flat(JSON.parse(readFileSync('src/content/bn.json', 'utf8')));
  const onlyEn = en.filter((k) => !bn.includes(k));
  const onlyBn = bn.filter((k) => !en.includes(k));
  if (onlyEn.length || onlyBn.length)
    fail(
      'en/bn key parity',
      `only in en: ${onlyEn.join(', ') || 'none'}\nonly in bn: ${onlyBn.join(', ') || 'none'}`,
    );
  else pass('en/bn key parity', `${en.length}/${bn.length}`);
}

/* ---- §4.1: every price is a marked placeholder ------------------------ */
{
  const sizes = readFileSync('src/lib/sizes.ts', 'utf8');
  if (!/TODO: client.*placeholder price/i.test(sizes))
    fail('§4.1 prices marked as placeholders', 'no TODO marker at the price data source');
  else pass('§4.1 prices marked as placeholders');

  // No price LITERAL may appear outside the data source. The pattern requires
  // an object literal whose first key is numeric, so `priceByPack={...}` as a
  // JSX prop pass-through does not trip it.
  const offenders = codeFiles.filter(
    (f) =>
      !f.endsWith('sizes.ts') &&
      /priceByPack\s*:\s*\{\s*\d/.test(readFileSync(f, 'utf8')),
  );
  if (offenders.length) fail('prices live only in sizes.ts', offenders.join('\n'));
  else pass('prices live only in sizes.ts');
}

/* ---- non-negotiable 3: excluded assets never ship --------------------- */
{
  const excluded = [
    'INTERNAL-BRIEF__do-not-publish__sap_c1',
    'navel_cutout_d1',
    'product_angle_b1',
  ];
  const publicFiles = walk('public').map((f) => f.replace(/\\/g, '/'));
  const leaked = excluded.filter((e) => publicFiles.some((f) => f.includes(e)));
  if (leaked.length) fail('excluded AI assets must not be in public/', leaked.join('\n'));
  else pass('excluded AI assets absent from public/');
}

console.log('');
if (failures) {
  console.log(`${failures} static check(s) failed.`);
  process.exit(1);
}
console.log('All static checks passed.');

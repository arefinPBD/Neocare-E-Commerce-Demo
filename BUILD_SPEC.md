# NeoCare Demo Landing — Build Spec
**v1.0** · For Claude Code · Companion to `DESIGN.md`

> **This is an imperative build spec, not a discussion document.** Where it says a value, use that value. Where it says TODO, stop and ask.
> Rationale lives in `NeoCare_Rebuild_Plan.md` — read that only if a decision here seems wrong.

---

## 1. What you are building

A **demo landing page** for NeoCare baby diapers. One route. No commerce.

Its purpose is to answer one question: *does the scroll-driven product centrepiece justify its cost?*

**In scope:** S0–S12 + footer, bilingual toggle, size selector, FAQ.
**Out of scope:** cart, checkout, payments, Medusa, CMS, `/shop`, PDPs, courier, SMS, email, 301s.

### Non-negotiables

1. **Mobile-first.** The <768px layout is the *primary* design. Build and verify it before writing a single desktop scroll effect. The real audience is mid-tier Android on mobile data in Bangladesh.
2. **Every scroll effect has a defined "off" state** that still communicates the product.
3. **No AI-generated image may carry a product claim.** Feature imagery uses real product photography only.
4. **Navel cutout appears in S9 only.** Never in S3–S8. It is a New Born SKU feature; showing it elsewhere is a false claim.

---

## 2. Setup

```bash
npx create-next-app@latest neocare-demo \
  --typescript --tailwind --app --src-dir --import-alias "@/*"
cd neocare-demo
npm i gsap lenis
npm i -D @next/bundle-analyzer
```

Next.js **16.3+** required — this spec uses `next/root-params`.

```
src/
  app/
    [lang]/
      layout.tsx
      page.tsx
    globals.css
  components/
    nav/Header.tsx  LanguageToggle.tsx
    sections/
      Hero.tsx TrustStrip.tsx ProductReveal.tsx
      FeatureCallouts.tsx NewbornSection.tsx
      SizeSelector.tsx Faq.tsx ShopCta.tsx Footer.tsx
    product/TurntableSequence.tsx FeatureArrow.tsx
    ui/Button.tsx Card.tsx Accordion.tsx
  lib/
    motion.ts        # GSAP setup, reduced-motion + connection guards
    useCanAnimate.ts
    sizes.ts         # weight → size lookup
  content/
    en.json  bn.json
  styles/tokens.css  # DESIGN.md §1-5 verbatim
public/
  product/turntable/frame-0000.webp … frame-0035.webp
  product/hero-frame.webp
  product/features/{sap,cuff,ear,velcro,backsheet}.webp
  hero/{hero-desktop,hero-mobile}.webp
  newborn/{cutout-flatlay,newborn-lifestyle}.webp
  brand/logo.svg
```

---

## 3. Design tokens

Copy `DESIGN.md` §1–5 into `src/styles/tokens.css` as CSS custom properties. Map into Tailwind via `theme.extend`. **Do not hardcode a hex anywhere in a component.**

Fonts: `next/font/google` — Poppins (400, 600) and Hind Siliguri (400, 600), `display: 'swap'`, preload the active locale's font only.

---

## 4. Assets

### Available now
| File | Use |
|---|---|
| `Diaper 34 Mockup-02.jpg` | Product cutout, feature anchor reference |
| `Medium_50pcs_01.png` | Pack render, S10 |
| `Medium_30pcs_02.png` | Pack render, S10 |
| Generated hero + lifestyle | S1, S2 |
| Real New Born photography | S9 |

### Not yet available — **turntable frames**

The rotation frames are being shot in-house and do not exist yet.

**Build `TurntableSequence` against this contract and it will work when frames land:**

```ts
interface TurntableProps {
  frameCount: number;              // 36 rough, 60 polished
  framePath: (i: number) => string;// `/product/turntable/frame-${String(i).padStart(4,'0')}.webp`
  fallbackSrc: string;             // '/product/hero-frame.webp'
  holdFrame: number;               // index the rotation locks to before S4 (default 8)
}
```

Behaviour:
- Preload all frames into `Image` objects before the pin activates. If any 404, **immediately fall back** to `fallbackSrc` static and disable scrubbing. No broken state, no console spam.
- Draw to `<canvas>` sized by `devicePixelRatio`, capped at 2.
- Below 768px: never fetch frames. Render `fallbackSrc` only.

**Until frames exist**, `fallbackSrc` is a cutout of `Diaper 34 Mockup-02.jpg`. The page must look finished, not broken.

**Image pipeline:** every raster → AVIF + WebP via `next/image`. Hero ≤ 180 KB. Never ship the 18 MB source PNGs.

---

## 5. Sections

Total landing scroll budget: **≤ 900vh**. Exceed it and users abandon before the CTA.

### S0 — Header
Sticky. Transparent over hero → `--nc-paper` + `--shadow-sm` after 80px scrolled. Logo left, nav centre (desktop only), language toggle right — **no cart icon** (§1 puts cart out of scope; an icon leading nowhere is worse than its absence). Mobile: logo + hamburger + toggle. Height 64px mobile / 80px desktop.

Nav items, left to right: Features, **Our Products** (hover/tap dropdown: Diapers Line, Adult Diapers, Baby Wipes, Face Wipes), **Parenting Journey** (hover/tap dropdown: Conception, Pregnancy, New Born, Baby, Family), New Born, Find your size, FAQ. The two dropdown parents and all their children link to `#` placeholders — subpages don't exist yet. Desktop opens on hover (CSS `group-hover`, with a padded gap so the pointer can cross into the menu without it closing); mobile nests each as a `<details>` disclosure inside the hamburger menu.

### S1 — Hero
Full-bleed `hero-mobile.webp` (<768px) / `hero-desktop.webp` (≥768px).

| Property | Desktop | Mobile |
|---|---|---|
| Image scale | 1.0 → 1.06 over 100vh, `scrub: 1` | none |
| Parallax | 8px down | none |
| Headline | fade+rise 24px, 600ms `--ease-out`, on load | same |

Headline uses `--text-display`, `--color-text-inverse`, with a scrim (`linear-gradient(180deg, rgb(0 0 0/.35), transparent 60%)`) for contrast — verify ≥4.5:1 against the actual image.

### S2 — Trust strip
Horizontal band, `--color-bg-brand-soft`. Incepta mark · "Made in Bangladesh" · "Trusted since [TODO: year]". Static, no animation. Height ~120px.

### S3–S8 — Product reveal + feature callouts

> **ONE ScrollTrigger. ONE pin. ONE GSAP timeline with labels.** Not six sections. Revision 1 of the plan got this wrong; do not reintroduce it.

```
ScrollTrigger:
  trigger: '#product-sequence'
  start:   'top top'
  end:     '+=550%'      // 550vh
  pin:     true
  scrub:   1
```

Timeline:

| Label | Range | Action |
|---|---|---|
| `reveal` | 0 → 150vh | Product scales 0.4 → 1.0, opacity 0 → 1, turntable scrubs frame 0 → `holdFrame` |
| — | — | **Rotation stops. Frame locks at `holdFrame` for the rest of the pin.** |
| `sap` | 150 → 220vh | Arrow draws to anchor, copy slides in +32px |
| `cuff` | 220 → 290vh | Previous copy out, arrow retargets |
| `ear` | 290 → 360vh | ″ |
| `velcro` | 360 → 430vh | ″ |
| `backsheet` | 430 → 500vh | ″ |
| `release` | 500 → 550vh | Copy out, product scales to 0.85, unpin |

#### 5.2 Arrow anchors — critical

Arrow endpoints are `{x%, y%}` **on the locked `holdFrame` only**. A percentage coordinate is meaningless on a rotating object — the leg cuff is elsewhere in frame 12 than frame 40, and invisible from the rear.

```ts
export const FEATURE_ANCHORS = {
  sap:       { x: 50, y: 62 },  // TODO: measure against real holdFrame
  cuff:      { x: 74, y: 55 },
  ear:       { x: 86, y: 30 },
  velcro:    { x: 88, y: 26 },
  backsheet: { x: 34, y: 44 },
} as const;
```

**These are placeholders.** Re-measure against the real frame before sign-off.

Arrow renders as an SVG path, 1.5px `--nc-green-700`, animated by `stroke-dashoffset` tied to timeline progress.

#### 5.3 Mobile — the primary path

Below 768px there is **no pin, no scrub, no arrows**. S3 is a single static product image. S4–S8 is a vertical stack of five cards, each: image + `--text-h2` title + body, fading in on `IntersectionObserver` at 15% visibility.

This must look intentional and finished — not like a degraded desktop page.

#### 5.4 Feature copy (English — Bangla is the client's)

| Key | Title | Body |
|---|---|---|
| `sap` | Super Absorbent Polymer | Locks moisture into the core and holds it there, so your baby's skin stays dry for longer. |
| `cuff` | Hydrophobic Leg Cuff | A soft raised barrier around each leg that guides moisture inward instead of out. |
| `ear` | Elastic Back Ear | Stretches as your baby moves and settles back, keeping the fit snug without pinching. |
| `velcro` | Adjustable Hook & Loop | Refasten as often as you need. Check, adjust and re-close without wasting a diaper. |
| `backsheet` | Breathable Textile Back Sheet | A cloth-like outer layer with thousands of micro-pores, letting air move through freely. |

> Client to review. Keep every claim descriptive — *what the part is and does*, never a measured performance figure. No "12 hours", no "99%", no percentages.

### S9 — New Born
**Hard visual break from S3–S8.** Full-width `--color-bg-brand-soft`, distinct heading, explicit **"New Born · 0–4 kg"** badge.

Content: `cutout-flatlay.webp` + copy on the umbilical cutout. Optional `newborn-lifestyle.webp`.

Copy: *"A gentle curve at the waistband leaves the healing navel untouched — designed for the first weeks, when skin is at its most delicate."*

Below the copy: a full-bleed endless gallery — the navel cutout plus the S3–S8 product crops (already cleared for reuse, §1 non-negotiable 3), reused here rather than newly generated. Built as a CSS marquee: the item list is rendered twice back-to-back and the track animates `translateX(0)` → `translateX(-50%)` on an infinite linear loop, so the wrap point is invisible. Starts only once the gallery is on screen (`IntersectionObserver`), pauses on hover/touch, and `prefers-reduced-motion: reduce` disables the animation entirely.

⚠ If this section reads as continuous with S3–S8, you are making a false product claim. Verify the break is unmistakable at every breakpoint.

### S10 — Size selector
Range input, 3–25 kg, step 0.5. Live-updates a recommended size card (pack render + size + weight range + pack sizes).

```ts
export const SIZES = [
  { size:'New Born', min:0, max:4,  packs:[20] },
  { size:'Small',    min:3, max:6,  packs:[50] },
  { size:'Medium',   min:4, max:9,  packs:[30,50] },
  { size:'Large',    min:7, max:18, packs:[50] },
  { size:'XL',       min:11,max:25, packs:[50] },
];
```

Ranges taken from the live site — **client to confirm**. Overlaps are intentional (they exist on the current site too).

**A11y:** real `<input type="range">` with `aria-valuetext="{weight} kilograms"`, plus a visible numeric readout. Keyboard-operable. Never a div with drag handlers.

### S11 — FAQ
Native `<details>`/`<summary>`. Emit `FAQPage` JSON-LD.

Twelve questions in plan §4.4. **Client must confirm every answer** — several restate delivery, minimum-order and returns policy, and the audit already found stale copy elsewhere on the site. Do not invent answers; leave `[TODO: client]` where unconfirmed.

### S12 — Shop CTA + Footer
Primary button "Shop Now" → `#` for the demo. Footer: logo, contact (single consistent phone format), DBID number, social, copyright **2026**.

---

## 6. Motion guards

`src/lib/useCanAnimate.ts`:

```ts
export function useCanAnimate() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 768) return;
    const c = (navigator as any).connection;
    if (c?.saveData) return;
    if (c?.effectiveType && ['slow-2g','2g','3g'].includes(c.effectiveType)) return;
    setOk(true);
  }, []);
  return ok;
}
```

> `saveData` and `effectiveType` are **Chromium-only** — absent on Safari and Firefox. So they are not the safety net. The **measured** guard below is:

Time the first 8 frame loads. If they exceed **1200ms**, abort the sequence, dispose the GSAP timeline, and render the static fallback. Log once.

Lenis: desktop only, `lerp: 0.1`. Never on mobile — it fights native scroll and breaks momentum on Android.

---

## 7. Bilingual

- Routes `/en` and `/bn`. **`en` is default** (overrides this spec's original `bn`-default call, per client request 2026-08-18 — the real audience remains Bangladeshi, this is a site-presentation choice, not a reversal of who the copy is written for).
- Read locale via `next/root-params` (`import { lang } from 'next/root-params'`) — no prop-drilling.
- Copy in `src/content/{en,bn}.json`, identical key structure. **Do not machine-translate Bangla** — the client writes it. Ship `bn.json` with English values and a `[BN]` prefix until supplied, so missing strings are visibly obvious rather than silently wrong.
- `<html lang>` drives the DESIGN.md §2 line-height fork.
- `hreflang` reciprocal tags on both routes.
- Never fix nav or button widths to English text. Bangla runs 15–30% longer.

---

## 8. Accessibility — WCAG 2.1 AA

- Semantic landmarks: `header`, `main`, `section`, `footer`. One `<h1>` (S1).
- All interactive elements keyboard-reachable, visible focus ring (2px `--color-focus`, 2px offset).
- Touch targets ≥ 44 × 44px.
- **The scroll experience must not hide content from keyboard or screen-reader users.** All S4–S8 copy present in the DOM at all times — animate opacity/transform, never `display:none`, never conditional mount.
- Decorative images `alt=""`. Product images get real descriptions.
- Test with the pin disabled. If content is unreachable, the implementation is wrong.

---

## 9. Performance gates — fail the build if exceeded

| Metric | Budget |
|---|---|
| LCP, Slow 4G / mid-tier Android | ≤ 2.5s |
| JS, gzipped | ≤ 180 KB |
| Hero image | ≤ 180 KB |
| Turntable total | ≤ 1.5 MB, desktop only, lazy |
| Bangla font, one weight | ≤ 100 KB |
| Total, first view | ≤ 1.2 MB |

Verify on **real hardware over throttled 4G**, not just DevTools.

---

## 10. Acceptance criteria

- [ ] Mobile (375px) reviewed and approved **before** any desktop scroll work
- [ ] Page fully usable with JS disabled
- [ ] `prefers-reduced-motion` renders end states, animates nothing
- [ ] Turntable 404s degrade silently to static
- [ ] Arrow anchors measured against the real `holdFrame`, not placeholders
- [ ] Navel cutout appears in S9 only
- [ ] No hardcoded hex outside `tokens.css`
- [ ] Both locales render; `[BN]` markers visible where copy is pending
- [ ] Total scroll ≤ 900vh
- [ ] Performance gates met on real hardware
- [ ] Keyboard-only traversal reaches every piece of content
- [ ] No claim on the page states a figure not confirmed by the client

---

## 11. Stop and ask

Do not guess on these:

1. **Numeral format** — `৳ 920` or `৳ ৯২০`? Unresolved.
2. **"Trusted since [year]"** in S2 — no year supplied.
3. **Size ranges** — taken from the live site, overlaps unconfirmed.
4. **FAQ answers** — several restate policy that may be stale.
5. **`holdFrame` index** — depends on the real turntable; 8 is a placeholder.
6. **Any performance figure** for the five features. If it isn't in this spec, it isn't approved. Never invent one.

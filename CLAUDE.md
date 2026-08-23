@AGENTS.md

# Rules
- BUILD_SPEC.md is authoritative. DESIGN.md defines all tokens.
- Mobile (<768px) is the primary design. Desktop is enhancement.
- Never invent a performance figure, percentage, or duration.
- Navel cutout: S9 only.
- No hardcoded hex outside tokens.css.
- Bangla copy is written, not machine-translated. Client to review before launch.

# Decisions recorded during build
- **Numerals:** Western digits in both locales via `src/lib/numerals.ts`
  (`bn-BD-u-nu-latn`). Answers DESIGN.md §8. Reversible by dropping `-u-nu-latn`.
- **Size overlap:** highest band-centrality wins the primary card; every other
  matching size renders as an alternate chip. Ties break to the larger size.
  See `src/lib/sizes.ts`.
- **Excluded assets** (BUILD_SPEC §1 non-negotiable 3 — no AI image may carry a
  product claim): `INTERNAL-BRIEF__do-not-publish__sap_c1.jpg`,
  `navel_cutout_d1.jpg`, `product_angle_b1.jpg`. See `scripts/build-assets.mjs`.
- **S9 has no compliant image.** Media holds no real New Born photography.
  Section renders a marked placeholder until the client supplies one.

- **Bangla copy written (2026-08-18).** The original rule was "leave [BN] markers,
  the client writes it"; the client instead asked for Bangla as a faithful
  translation of the English. `bn.json` now carries real Bangla, zero [BN]
  markers, key parity verified (104/104). Brand and legal-entity names stay in
  Latin script (`NeoCare`, `Incepta Hygiene & Hospicare Ltd.`) to match the
  packaging; the five feature titles are transliterated for the same reason.
  Numerals stay Western per the numerals decision above. **Still needs a native
  reviewer's sign-off** — it is written Bangla, not client-approved Bangla.
- **`[TODO: client]` markers survive translation.** Every unconfirmed *fact*
  (delivery times, pack counts, minimum order, returns, payment, offline
  stockists, "trusted since" year, footer contact, DBID) is still a marker in
  both locales. Only voice-level copy carrying no unverified claim was written:
  hero headline, S12 CTA title/body, and FAQ 7 / 8 / 12.
- **FAQ 8 ("safe for newborn skin?") needs compliance sign-off.** The answer is
  descriptive only — it states no certification, test result or figure — but it
  is a safety statement on a baby-care product. Legal/compliance reads it before
  launch.

# Stages
1. Foundation — tokens, fonts, routing, content JSON. **done**
2. Mobile 375px, static, complete. No GSAP/pin/scrub/Lenis. **done**
3. Desktop >=768px enhancement. One ScrollTrigger, one pin, one timeline. **done**
4. Hardening — a11y §8, performance gates §9. **done**
5. v2.0 storefront rebuild (BUILD_SPEC v2.0, 2026-08-18) — see breakdown below. **done**

# Stage 3 notes
- `lib/sequence.ts` holds sequence constants (no gsap import). `lib/motion.ts`
  holds the gsap/ScrollTrigger/Lenis runtime and is **dynamically imported
  only**, after the §6 guards pass — it is 47.9 KB gz that mobile never fetches.
- The desktop pinned layout lives in `globals.css`, gated on BOTH `min-width:
  768px` AND `[data-pinned="true"]`. The off-state is the default, not a
  fallback: if the guards fail, the stacked layout renders and no GSAP loads.
- Arrow endpoint is derived from timeline position in `tl.eventCallback
  ('onUpdate')`, never inside a tween's onUpdate — tween render order is not
  stable, and `fromTo` renders immediately on creation.
- ScrollTrigger needs an explicit `refresh()` after the timeline is built, or
  functional `end` stays null and the pin distance is zero. Refresh fires on
  settle, on `document.fonts.ready`, and on `load`.
- Dev-only URL flags (never in a production build): `?motion=force` forces the
  pinned path, `?motion=off` forces the guarded off-state for the §8
  "test with the pin disabled" check. `window.__ST` / `__gsap` exposed in dev.

Do not start a stage before the previous one is signed off.

# Stage 4 notes
- **Hero scrim retuned.** The spec's `linear-gradient(180deg, rgb(0 0 0/.35),
  transparent 60%)` darkens the TOP; the hero is a light cream blanket and the
  copy is bottom-anchored, so the headline measured 1.24:1 and the subhead
  1.08:1 against real sampled pixels. §5 S1 makes the ratio the requirement and
  the gradient the means, so stops were retuned against measured pixels.
  Now 4.6:1 / 6.39:1 mobile, 3.88:1 / 6.49:1 desktop.
- **Muted text on tinted surfaces.** DESIGN.md §1 quotes ratios against
  --nc-paper. --nc-ink-500 falls to 4.44:1 on --nc-cream and 4.32:1 on
  --nc-mint-50. globals.css steps muted text to --nc-ink-700 on those two
  surfaces only. Do not revert without re-measuring.
- Contrast is verified by sampling actual image pixels / computed styles, never
  from the token table. Re-run that check if the hero photography changes.

# Stage 5 — v2.0 storefront rebuild (BUILD_SPEC v2.0)

Built in dependency order so each stage was independently verifiable
(`tsc --noEmit` + a curl smoke test against the dev server) before the next
one relied on it:

1. **Data layer.** `lib/sizes.ts` extended with `slug` + `priceByPack`
   (placeholder prices, §4.1). New `lib/cart.ts` (cart math: line/subtotal
   totals, storage key, a `localStorage`-shape type guard) and
   `lib/placeholderCatalogue.ts` (§4.2's three placeholder categories).
   `numerals.ts` got `fmtMoney`.
2. **Cart infrastructure.** `components/cart/CartContext.tsx` (Context +
   `localStorage`, hydration-guarded), `CartSidebar.tsx` (built on a native
   `<dialog>` for free focus-trap/`Escape`/backdrop — simpler and more robust
   than a hand-rolled trap), `CartItemRow.tsx`.
3. **Product components.** `components/product/AddToCartButton.tsx`,
   `ProductCard.tsx` (quick-add gated on single-pack products, §5.2),
   `components/sections/ProductGrid.tsx` (homepage Shop section).
4. **Routes.** `app/[lang]/product/[slug]` (PDP, `generateStaticParams` over
   the 5 real slugs), `app/[lang]/products` (full grid), `app/[lang]/category/
   [slug]` (the 3 placeholder categories, add-to-cart disabled by default),
   `app/[lang]/checkout` (static summary, §6.4 — never implies a completed
   transaction).
5. **Header wiring.** `nav/SearchInput.tsx` (client-side filter, no backend)
   and `nav/CartButton.tsx` added to `Header.tsx`; nav's "Our Products"
   dropdown now points at real routes instead of `#` (Diapers Line → 
   `/products`, the other three → `/category/{slug}`); Parenting Journey
   untouched (`#`, out of scope, §13).
6. **Homepage reorder + wiring.** `app/[lang]/page.tsx` reordered to §5.0
   (Hero → ProductGrid → TrustStrip → NewbornSection → SizeSelector → Faq →
   ProductSequence("Look Closer") → Footer); `ShopCta.tsx` deleted (dead code
   — superseded by ProductGrid); `layout.tsx` wraps `children` in
   `CartProvider` and mounts `CartSidebar` globally.
7. **Content.** New `shop`/`pdp`/`cart`/`category`/`checkout`/`search` keys
   added to both `en.json` and `bn.json` (direct Bangla translation, not
   `[BN]`-prefixed — same precedent as the earlier nav-dropdown labels: short,
   factual UI strings, no unverified claims). Removed the now-dead `cta` block
   and `footer.demoNote` (both only referenced by the deleted `ShopCta`).

Verified end-to-end via `tsc --noEmit` (clean) and curl smoke tests against
every new route in both locales, plus a byte-offset check on the homepage
HTML confirming section order matches §5.0 exactly. Not verified in an actual
browser (no Playwright/browser automation available in this environment) —
still worth a manual pass for the cart drawer's focus/`Escape` behaviour and
the search popover's keyboard nav before calling this done.

# Stage 6 — v3.0 storefront (BUILD_SPEC v3.0, DESIGN.md v2.0, 2026-08-19)

## Decisions taken with the client before any code was written

- **Scope:** full v3.0 — homepage upper half, PDP, and cart page.
- **`design-taste-frontend` is a judgment layer only.** It governs composition,
  section rhythm, hero discipline and the anti-slop audit. It does NOT override
  the spec: no Motion library, no icon library, no dark mode, no token changes.
  Its em-dash ban and dependency defaults are explicitly declined — §2's
  "add no dependencies" and the 180 KB budget outrank them.
- **Reference kit:** built from the BUILD_SPEC/DESIGN.md tables alone. The
  `shirt-shop` files named in §0 (`DESIGN-SYSTEM.md`, `tokens.css`,
  `ui-kit.tsx`) were never delivered into the repo and are not needed.
- **Copy:** English gets the taste skill's copy self-audit, delivered as a diff
  for client approval and NOT applied unilaterally. `bn.json` is untouched, so
  approving the diff makes the locales diverge in content until re-translated.
- **Promo bar:** `promo.text` ships as an empty string, so §5.1's "render
  nothing at all" branch is the shipped state. No offer is invented.
- **Cart:** `/cart` and `/checkout` stay merged on the existing `/checkout`
  route, per §7.2's default.
- **Verification:** Playwright added as a devDependency. It is the only way to
  check the §12 criteria that require a real browser.

## Baseline measured before any v3.0 change (commit a566395)

| | mobile-375 | tablet-768 | desktop-1280 | Budget |
|---|---|---|---|---|
| Homepage scroll (en) | 1074vh | 1347vh | 1377vh | ≤900vh |
| Homepage scroll (bn) | 1083vh | 1364vh | 1410vh | ≤900vh |
| Homepage JS (gz) | 150.1 KB | 198.1 KB | 198.1 KB | ≤180 KB |
| Homepage total (gz) | 707 KB | 724 KB | 743 KB | ≤1.2 MB |

Four pre-existing defects found, and what was decided about each:

1. **No site chrome off the homepage.** `/products`, `/product/[slug]`,
   `/checkout` and `/category/[slug]` rendered a bare `<main>` — no header,
   nav, cart, language toggle or footer. §5.1–§5.3 cannot be built without
   them. **Decision:** promo bar, `Header` and `Footer` move into
   `app/[lang]/layout.tsx` and render for every route.

2. **Scroll budget unreachable as specified.** Attribution at
   `artifacts/baseline/scroll-*.json`: `product-sequence` is 850vh on desktop
   (`SEQUENCE.totalVh` 750 + the 100vh pinned viewport) and the homepage
   `ProductGrid` is 135vh desktop / 306vh mobile while rendering the same five
   products as `/products`. Non-sequence content alone costs 527vh on desktop,
   so even at §4.2's own 550vh pin the page lands at ~1177vh. The 900vh figure
   was written in `NeoCare_Rebuild_Plan.md` §4.2 for a page whose S12 was a
   CTA button, and was never re-derived after v2.1 added a full product grid.
   **Decision:** replace the homepage grid with a compact Shop CTA carrying a
   three-product teaser plus a link to `/products`; keep `featureVh` at 110
   (reverting it re-breaks the readability fix in the Stage 3 notes); amend
   §11's desktop budget to a measured figure. Mobile is expected to pass.

3. **`diaper-3d.gif` is 339 KB and loaded on mobile** — 48% of the mobile
   homepage payload, for a motion asset the rebuild plan §5 puts on desktop
   only. **Decision:** gate it behind the same ≥768px guard `lib/motion.ts`
   already uses, so mobile never fetches it.

4. **Desktop JS over budget at baseline** (198.1 KB vs 180 KB). The 48 KB delta
   is the guarded GSAP/Lenis chunk — the architecture working as designed.
   **Decision:** the 180 KB gate is read against mobile, which §1
   non-negotiable 1 defines as the primary experience and which passes with
   30 KB of headroom. The desktop figure is recorded as a deliberate cost.

## Stage 6 results — measured after the v3.0 build

| | mobile-375 | tablet-768 | desktop-1280 | Budget |
|---|---|---|---|---|
| Homepage scroll (en) | **882vh** ✓ | 1255vh | 1334vh | ≤900vh |
| Homepage scroll (bn) | **887vh** ✓ | 1271vh | 1367vh | ≤900vh |
| Homepage JS (gz) | **151.9 KB** ✓ | 199.9 KB | 199.9 KB | ≤180 KB |
| Homepage total (gz) | **400.9 KB** ✓ | 726.6 KB | 750.7 KB | ≤1.2 MB |
| Largest image | **29.9 KB** ✓ | 339 KB (gif) | 339 KB (gif) | ≤180 KB |

Mobile — the primary experience per §1 non-negotiable 1 — now passes every
gate it was failing at baseline. Desktop's two overruns are documented and
deliberate; BUILD_SPEC §11 carries both figures and the reasoning.

### Contrast — a real AA failure, found and fixed

§10 names the header-over-hero case as "the risk case", and it was right.
§5.2 item 4 moves the nav links to `--nc-ink-500`, which measures 4.6:1 on
white but is not the same measurement over a 45%-opacity photograph.

Measured off the actual painted strip. `tests/contrast.spec.ts` hides
everything the header draws, screenshots the strip, and reads that PNG back
into a canvas inside the page, so the background sampled is the one the
browser composited rather than one the test reconstructed:

| | before | after |
|---|---|---|
| desktop, worst pixel | 2.74:1 | **10.36:1** |
| desktop, *lightest* pixel | 4.47:1 | 16.88:1 |
| tablet, worst pixel | 5.07:1 | 5.07:1 |
| mobile, worst pixel | 1.31:1 | **4.95:1** |

Note the desktop *best* case was 4.47:1 — under AA against every pixel behind
the header, not only the dark ones.

Fix: `Header` sets `data-at-top` and carries `group`, so while the header is
transparent its controls render at `--nc-ink-900`. Once it goes solid at 80px,
§5.2's `--nc-ink-500` applies exactly as specified. The nav links, cart glyph,
cart count and language toggle all follow it.

**Do not revert this without re-measuring**, and re-run
`tests/contrast.spec.ts` if the hero photography changes — these numbers are
properties of that specific image.

### Other defects found and fixed during the build

- **SearchInput had no focus indicator.** It carried `outline-none`, opting out
  of the global `:focus-visible` floor in `globals.css` and leaving a 1px
  border-colour change as the only cue. §10 requires a visible indicator on
  every control.
- **The logo rendered at 0×44.** §5.2's left zone is `flex-1`, so with a ~640px
  nav beside it the logo link was the flex item that gave, and `w-auto`
  collapsed it rather than overflowing. `shrink-0` on the link.
- **The nav wrapped to two lines at 1280px.** Top-level items measured 59-81px
  tall instead of 44px, and the nav sat at `md:block` where six items plus the
  search field genuinely do not fit. Now `lg:block` with `space-x-8` and
  `whitespace-nowrap`; the `<details>` disclosure moved to `lg:hidden` so
  nothing is unreachable between 768px and 1024px.
- **Cart rows animated on page load.** DESIGN.md §5 rules out any animation not
  covering a visitor-caused state change. `CartItemList` now tracks which rows
  are genuinely new, and skips the exit animation entirely under reduced
  motion rather than stalling 300ms on something invisible.

### Verification

- `node scripts/check-static.mjs` — 6 checks, no server needed.
- `npx playwright test` — 102 tests across mobile-375, tablet-768 and
  desktop-1280: acceptance (§12), contrast (§10), cart (§7), scroll budget
  (§5.4), payload budgets (§11), plus full-page screenshots per route and
  locale under `artifacts/`.
- `npx tsc --noEmit` and `npm run build` both clean.

### Still open, and why

- `COPY_AUDIT.md` — the English copy audit, delivered as a proposal and **not
  applied**. Six strings are inaccurate as they stand, eight keys are dead, and
  six New Born gallery alt strings are too generic to distinguish the images
  they describe.
- The §14 "stop and ask" list is unchanged: real prices, per-size PDP
  descriptions, promo copy, shipping and tax treatment, the "trusted since"
  year, size ranges, FAQ answers, and the `holdFrame` index.
- LCP is not yet measured on real hardware. The rebuild plan §5 asks for a
  mid-tier Android on throttled 4G, not DevTools.
- FAQ 8 still needs compliance sign-off, and `bn.json` still needs a native
  reviewer.

# Stage 7 — v3.1 real product catalogue (BUILD_SPEC v3.1, 2026-08-23)

`../Media` was analysed image by image, not by filename. It yields **16 unique
products** across the four dropdown categories, from 19 usable packshot files —
the extra 3 are second crops of packs already counted, and become `gallery`
entries rather than products. Also present and excluded: 5 byte-identical `(1)`
copies, and 3 non-products (a Facebook page comp, the internal-brief SAP
render, an unbranded AI diaper).
v3.0's nine invented placeholder products are deleted.

## Decisions taken with the client before any code was written

- **Brand treatment:** the Adult products are Aspire and the face wipes are
  Lumera / Viva — sister Incepta brands, not NeoCare. Chosen: **list them with
  neutral names** ("Adult Pant Diaper — M, 8 pcs"), packshot unretouched,
  `category.brandNote` disclosing the real brands on the page. Not chosen:
  naming the brands in copy, or holding the categories back.
- **Prices and cart:** placeholder price + working add-to-cart, on §4.1's
  existing convention (figure shown plainly, TODO marker in code). This
  resolves §14 item 12 as "enabled".
- **Homepage:** "Our Best Sellers" (four products, one per dropdown category)
  followed by four compact category rows with the best sellers excluded.
- **Best-seller picks** are the client's, not derived: Medium 50 pcs, Adult
  Pant Diaper M 8 pcs, Baby Wipes 120 pcs, Refreshing Wipes. §1 non-negotiable
  7 still holds — no rank, units-sold or "#1" appears anywhere. If the client
  withdraws the picks, the heading goes with them.
- **Size finder:** each of the five sizes shows its own pack photograph. Pack
  lists are NOT extended — `Media` holds a Small 32-pcs packshot, but adding a
  32-pack would invent a SKU, so that file is deliberately unused.
- **Adult extras:** underpads under Adult Diapers; the adult wet towel under
  Baby Wipes, grouped by product form. Its name says "Adult" so the listing is
  not misleading.

## Architecture

`lib/catalogue.ts` is now the single catalogue (16 products). `lib/sizes.ts`
keeps the weight-band logic and re-exports the diaper slice, so every existing
`@/lib/sizes` import still resolves. `lib/placeholderCatalogue.ts` and
`sections/ShopCta.tsx` are deleted.

`CartItem.sizeKey` widened from `SizeKey` to `ProductKey`. **The field name is
deliberately unchanged** — it is persisted in visitors' `localStorage` under
`neocare-cart-v1`, and renaming it would silently empty every existing cart.

`scripts/check-static.mjs` was updated to read the price rules against
`catalogue.ts` rather than `sizes.ts`.

## Two real defects found while measuring

**1. The category rows broke the mobile scroll budget.**

Everything else on the homepage costs 885vh at 375px against §11's 900vh gate —
15vh of headroom. The rows, as a two-up grid, cost 340vh (1224vh total, 36%
over). Rebuilt as a mobile horizontal scroller that came down to 226vh — still
1111vh, still 24% over. There is no form of the section that fits.

First resolution was `hidden sm:block` (885vh ✓) — the section met the gate by
not existing on the primary viewport. **Superseded the same day**: the client
asked for the rows on mobile, so the budget was won back properly instead. Four
things were each independently wrong, and BUILD_SPEC §11.2 has the table:

| Fix | Saved |
|---|---|
| `--section-rhythm` is a viewport-HEIGHT clamp → 81px `padding-block` per section, 835px (103vh) across the homepage. Flat 44px below 768px; desktop untouched. | ~46vh |
| Category row headings wrapped to two lines at 343px (87px × 4). Short `shop.seeAll` label below sm + one type step down → 38px. | ~15vh |
| The lone Face Wipes card fell through to the grid branch's `mx-auto max-w-xs` and capped its whole row at 320px. `SCROLLER_COLUMNS` is now `sm:`-only and may never set a width. | ~32vh |
| Look Closer stacked five full-width photo cards on mobile — 1747px, 30% of the homepage, for five captions of the same shape. Now one swipeable row (§5.6). | ~171vh |

**847vh en / 867vh bn ✓ with the rows visible on mobile**, 33vh of headroom —
35vh better than v3.0 managed with three fewer categories on the page.

The `--section-rhythm` finding is the transferable one: a spacing token defined
in `vh` scales with the axis that has nothing to do with how much air a layout
needs. It bought the least and cost the most exactly where the primary
viewport is.

One more defect the measurement caught: with `snap-x`, the browser seats the
first item against the SCROLLPORT edge, which ignores padding — so each row
scrolled itself 16px on load and every card sat 16px left of its own heading.
`scroll-px-4` on the row fixes it. Eyeballing a screenshot is what first
suggested it; `getBoundingClientRect` is what proved it.

Verified rather than assumed, after the Look Closer change: desktop still
reports `data-pinned=true` with the copy list computing to `display: block` and
exactly one callout visible mid-sequence; reduced motion shows all five cards at
opacity 1 with zero running animations; all scrolling rows are keyboard
focusable and named, and the one row with nothing to scroll takes no tab stop.

**2. Fourteen `/_next/image` requests on the homepage, every one an upscale.**

The packshots are 300×300 and `build-assets.mjs` already emits tuned WebP at
5–19 KB. next/image was being asked for w=384/640/750 variants of a 300px
source. Measured on `adult-wet-towel`: w=640 is 5,382 bytes against the
original's 6,344. `servesOriginal()` (§11.1) sends any ≤400px packshot straight
through — **14 optimizer requests → 0**.

> Surfaced as a `waitUntil: 'networkidle'` hang in the desktop Playwright run
> that looked like a code regression and was not. A request aborted mid-write
> poisons its `.next/cache/images` entry, and every later request for that key
> then blocks forever while `curl` serves the same URL in 30ms. **If an image
> request hangs but curl is fine: delete `.next/cache/images` and restart.**
> Each timed-out test run poisons another entry, so it looks self-sustaining.

## Results

| | v3.0 | v3.1 | Budget |
|---|---|---|---|
| Homepage scroll — mobile en | 882vh | **847vh** ✓ | ≤900vh |
| Homepage scroll — mobile bn | 887vh | **867vh** ✓ | ≤900vh |
| Homepage JS gz — mobile | 151.9 KB | **152.2 KB** ✓ | ≤180 KB |
| Homepage total gz — mobile | 400.9 KB | **507.2 KB** ✓ | ≤1.2 MB |
| Homepage `/_next/image` reqs | 14 (after this work's content) | **0** | — |
| Homepage scroll — desktop en | 1334vh | 1580vh | documented overrun |

Eleven extra products on the landing page, all four categories visible on
mobile, and the page is **35vh shorter than v3.0**.

## Verification

- `npx tsc --noEmit` clean; `npm run build` clean (47 static pages, 32 PDPs).
- `node scripts/check-static.mjs` — 6/6.
- `npx playwright test` — **106 passed, 0 failed, 8 skipped** across
  mobile-375 / tablet-768 / desktop-1280.
- Every packshot was inspected visually before being catalogued. Filenames lie:
  `NeoCare Baby Diaper Sizes Small Medium Large XL.png` is a single Small 32-pcs
  pack, not a size chart.

## Still open

§14 grew items 13–19: brand treatment, best-seller confirmation, the two
illegible face-wipe pack counts, whether Small 32 pcs is a real SKU,
higher-resolution packshots (everything non-diaper is 300×300, which is the
ceiling for the PDP hero at ~740px), PDP descriptions and Bangla names for the
eleven new products. Items 1–11 are unchanged. Item 12 is resolved.

@AGENTS.md

# Rules
- BUILD_SPEC.md is authoritative. DESIGN.md defines all tokens.
- Mobile (<768px) is the primary design. Desktop is enhancement.
- Never invent a performance figure, percentage, or duration.
- Navel cutout: the New Born section only.
- No hardcoded hex outside tokens.css.
- Bangla copy is written, not machine-translated. Client to review before launch.
- Every figure in this file was measured. If you change the thing it describes,
  re-measure — do not update the number by reasoning about it.

---

# Decisions in force

These govern the current code. Each one has a cost attached to reverting it.

- **Numerals: Western digits in both locales**, via `src/lib/numerals.ts`
  (`bn-BD-u-nu-latn`). The pack prints "M" and "50 pcs" in Western digits, so a
  page rendering ৫০ beside it creates friction at the point of recognition.
  Reversible by dropping `-u-nu-latn`; nothing else changes.
- **Size overlap resolves by band centrality.** Highest centrality wins the
  recommended card; every other matching size renders as an alternate chip, so
  no valid option is hidden. Ties break to the larger size — on a growing baby
  the bigger of two equally-central sizes lasts longer. `src/lib/sizes.ts`.
- **Excluded source assets** (non-negotiable 3 — no AI image may carry a
  product claim): `INTERNAL-BRIEF__do-not-publish__sap_c1.jpg`,
  `product_angle_b1.jpg`, `S1 Opt 2.png`. Listed in `scripts/build-assets.mjs`
  and enforced by `scripts/check-static.mjs`.
- **The New Born section has no compliant photograph.** Media holds no real
  New Born umbilical-cutout image. The section renders a marked placeholder
  until the client supplies one.
- **Bangla is written, not approved.** `bn.json` carries real Bangla with zero
  `[BN]` markers, key parity verified (174/174). Brand and legal-entity names
  stay in Latin script (`NeoCare`, `Incepta Hygiene & Hospicare Ltd.`) to match
  the packaging; the five feature titles are transliterated for the same
  reason. **Still needs a native reviewer's sign-off.**
- **`[TODO: client]` markers survive translation.** Every unconfirmed *fact*
  (delivery times, pack counts, minimum order, returns, payment, offline
  stockists, "trusted since" year, footer contact, DBID) is a marker in both
  locales. Only voice-level copy carrying no unverified claim was written.
- **FAQ 8 ("safe for newborn skin?") needs compliance sign-off.** The answer is
  descriptive and states no certification, test result or figure — but it is a
  safety statement on a baby-care product.

---

# Architecture

## Catalogue

`lib/catalogue.ts` is the single catalogue: 16 products across four categories.
`lib/sizes.ts` holds the weight-band logic and re-exports the diaper slice, so
`@/lib/sizes` stays a valid import path.

**`CartItem.sizeKey` is typed `ProductKey`, but the field name is not
`productKey` on purpose.** It is persisted in visitors' `localStorage` under
`neocare-cart-v1`; renaming it silently empties every existing cart.

Everything diaper-specific on the PDP is gated behind `isSizeRow()`. That is a
correctness gate, not a layout one: the five feature close-ups and their five
bullets are claims about the diaper, and attaching them to a wipes or
adult-diaper page would be a product claim about a different product.

## Motion

- `lib/sequence.ts` holds sequence constants and imports no gsap.
  `lib/motion.ts` holds the gsap/ScrollTrigger/Lenis runtime and is
  **dynamically imported only**, after the guards pass — 47.9 KB gz that mobile
  never fetches.
- The desktop pinned layout lives in `globals.css`, gated on BOTH
  `min-width: 768px` AND `[data-pinned="true"]`. **The off-state is the
  default, not a fallback:** if the guards fail, the stacked layout renders and
  no GSAP loads.
- Arrow endpoints derive from timeline position in `tl.eventCallback('onUpdate')`,
  never inside a tween's `onUpdate` — tween render order is not stable, and
  `fromTo` renders immediately on creation.
- ScrollTrigger needs an explicit `refresh()` after the timeline is built, or
  functional `end` stays null and the pin distance is zero. Refresh fires on
  settle, on `document.fonts.ready`, and on `load`.
- Dev-only URL flags (never in a production build): `?motion=force` forces the
  pinned path, `?motion=off` forces the guarded off-state. `window.__ST` /
  `__gsap` exposed in dev.

---

# Measured findings — do not revert without re-measuring

## Contrast

Contrast is verified by sampling actual painted pixels, never read off the
token table. `tests/contrast.spec.ts` hides everything the header draws,
screenshots the strip, and reads that PNG back into a canvas inside the page,
so the sampled background is the one the browser composited.

- **Hero scrim.** A `180deg` scrim darkens the TOP; the hero is a light cream
  blanket with bottom-anchored copy, so the headline measured 1.24:1 and the
  subhead 1.08:1. Stops were retuned against measured pixels — now 4.6:1 /
  6.39:1 mobile, 3.88:1 / 6.49:1 desktop.
- **Header over the hero photograph.** Nav links at `--nc-ink-500` measure
  4.6:1 on white, which is not the same measurement over a 45%-opacity
  photograph: desktop's worst pixel was 2.74:1 and its *lightest* was 4.47:1 —
  under AA against every pixel, not only the dark ones. Mobile was 1.31:1.
  `Header` now sets `data-at-top` and carries `group`, so while transparent its
  controls render at `--nc-ink-900`; once solid at 80px, `--nc-ink-500`
  applies. Now 10.36:1 desktop, 4.95:1 mobile.
- **Muted text on tinted surfaces.** `--nc-ink-500` falls to 4.44:1 on
  `--nc-cream` and 4.32:1 on `--nc-mint-50`. `globals.css` steps muted text to
  `--nc-ink-700` on those two surfaces only.

**Re-run `tests/contrast.spec.ts` if the hero photography changes** — these
numbers are properties of that specific image.

## Mobile scroll budget

Everything except the category rows costs 885vh at 375px against a 900vh gate.
The rows first cost 226vh into 15vh of headroom. Rather than hiding the section
below 640px, four independently-wrong things were fixed:

| Fix | Saved |
|---|---|
| `--section-rhythm` is a viewport-HEIGHT clamp → 81px of `padding-block` per section, 162px between every adjacent pair, 835px (103vh) across the homepage. Flat 44px below 768px; desktop untouched. | ~46vh |
| Category row headings wrapped to two lines at 343px (87px × 4). Short `shop.seeAll` label below sm plus one type step down → 38px. | ~15vh |
| The lone Face Wipes card fell through to the grid branch's `mx-auto max-w-xs` and capped its whole row at 320px. `SCROLLER_COLUMNS` is now `sm:`-only and may never set a width. | ~32vh |
| Look Closer stacked five full-width photo cards — 1747px, 30% of the homepage, for five captions of the same shape. | ~171vh |

Look Closer was then rebuilt again (§5.6). The swipeable row it first became
clipped the peek card mid-word and hid main content behind a gesture — fine for
a browse row, wrong for the product's entire sales argument. It is now a
numbered anatomy image over a numbered list. Three further defects surfaced
doing it:

- **The stage box had the wrong aspect ratio for the image the phone gets.**
  `aspect-[1200/1698]` is the desktop GIF's shape; `<picture>` serves mobile a
  720x560 still. `object-contain` letterboxed it — 511px box, 281px image,
  **230px of dead space**. The `<img>` was also declaring the GIF's intrinsic
  size. This was the "huge empty screen" reported from a real phone.
- **`FEATURE_ANCHORS` were guesses and are wrong.** Checked against the crop
  windows in `build-assets.mjs`: `ear` was off by 45 percentage points in x.
  They drive the desktop arrow, so they were left alone; mobile markers use a
  separate `FEATURE_MARKERS` derived from the crop centres. **Never merge the
  two — they are measured against two different images.**
- **Bangla is the binding locale on this page**, ~20vh longer than English. The
  rebuild passed English at 868vh while Bangla sat at 893vh against a 900vh
  gate. Dropping the mobile card chrome bought 25vh back.

**The transferable one:** a spacing token defined in `vh` scales with the axis
that has nothing to do with how much air a layout needs. It bought the least
and cost the most exactly where the primary viewport is.

## Images

- **`servesOriginal()` sends ≤400px packshots past the optimizer.** Every
  variant `next/image` produced was an upscale of a 300px source — measured on
  `adult-wet-towel`, w=640 is 5,382 bytes against the original's 6,344. 14
  optimizer requests on the homepage → 0.
- **`.next/cache/images` can poison itself.** A request aborted mid-write
  leaves a cache key that blocks every later request for it, forever, while
  `curl` serves the same URL in 30ms. Each timed-out test run poisons another
  entry, so it looks self-sustaining and like a code regression. **If an image
  request hangs but curl is fine: delete `.next/cache/images` and restart.**
- **`scroll-px-4` on every snap row.** With `snap-x` the browser seats the first
  item against the scrollport edge, which ignores padding — each row scrolled
  itself 16px on load and every card sat left of its own heading.

## Other fixed defects worth not reintroducing

- **Cart rows must not animate on page load.** DESIGN.md §5 rules out any
  animation not covering a visitor-caused state change. `CartItemList` tracks
  which rows are genuinely new, and skips the exit animation entirely under
  reduced motion rather than stalling 300ms on something invisible.
- **`SearchInput` needs a focus indicator.** It carried `outline-none`, opting
  out of the global `:focus-visible` floor.
- **The logo needs `shrink-0`.** The header's left zone is `flex-1`, so with a
  ~640px nav beside it the logo was the flex item that gave and `w-auto`
  collapsed it to 0×44.
- **The nav sits at `lg:block`, not `md:block`.** Six items plus the search
  field do not fit at 768px. The `<details>` disclosure is `lg:hidden` so
  nothing is unreachable between 768px and 1024px.
- **A row with nothing to scroll takes no `tabIndex`** — a focusable element
  that does nothing is a dead stop in the tab order.

---

# Current measurements

| | mobile-375 | tablet-768 | desktop-1280 | Budget |
|---|---|---|---|---|
| Homepage scroll (en) | **859vh** ✓ | 1440vh | 1583vh | ≤900vh (mobile gate) |
| Homepage scroll (bn) | **879vh** ✓ | 1461vh | 1621vh | ≤900vh (mobile gate) |
| Homepage JS (gz) | **152.2 KB** ✓ | 200.2 KB | 200.2 KB | ≤180 KB (mobile gate) |
| Homepage total (gz) | **507.2 KB** ✓ | 866 KB | 832 KB | ≤1.2 MB |
| Largest image | **29.9 KB** ✓ | 339 KB (gif) | 339 KB (gif) | ≤180 KB |

Mobile passes every gate. Desktop's overruns are deliberate and documented in
BUILD_SPEC §11: the 48 KB GSAP/Lenis chunk and the 850vh pinned sequence are
both desktop-only by design, and mobile requests neither.

---

# Verification

```
npx tsc --noEmit          # clean
npm run build             # clean — 47 static pages, 32 PDPs
node scripts/check-static.mjs   # 6/6, no server needed
npx playwright test       # 106 passed across mobile-375 / tablet-768 / desktop-1280
```

Playwright covers acceptance criteria, contrast sampled on rendered pixels,
cart behaviour, scroll budget, payload budgets, and full-page screenshots per
route and locale under `artifacts/`.

`node scripts/build-assets.mjs` regenerates every image in `public/` from
`../Media`. That folder is outside the repo and untracked — it is the only copy
of the source images.

---

# Still open

- **BUILD_SPEC §14** — 18 items the client must confirm, chiefly real prices,
  the brand treatment for the Aspire/Lumera/Viva products, the two illegible
  face-wipe pack counts, and whether a Small 32-pcs SKU exists.
- **BUILD_SPEC §15** — English copy findings, none applied: three inaccurate
  strings, six too-generic gallery alt texts (an accessibility defect), and
  eight dead content keys.
- **LCP is not measured on real hardware.** It needs a mid-tier Android on
  throttled 4G, not DevTools.
- **FAQ 8 needs compliance sign-off; `bn.json` needs a native reviewer.**

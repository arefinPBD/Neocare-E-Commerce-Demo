# NeoCare Demo Storefront — Build Spec
**v3.1** · 23 August 2026 · For Claude Code · Companion to `DESIGN.md`

> **This is an imperative build spec, not a discussion document.** Where it says a value, use that value. Where it says **Stop and ask**, stop and ask.
> This is the only version. Earlier drafts are not in the tree; if you need the
> reasoning behind a line that looks odd, the commit history has it.

---

## 0. What this builds

A bilingual (en/bn) demo storefront for NeoCare, a Bangladeshi baby-diaper
brand made by Incepta Hygiene & Hospicare Ltd. Next.js App Router, statically
generated, no backend of any kind.

**The layout is based on the `shirt-shop` reference kit**
(`vercel/flags → examples/shirt-shop`, MIT). What is taken from it: layout,
grid geometry, type hierarchy, spacing rhythm, radii, interaction states,
motion behaviour and component anatomy. What is **not** taken: its colour
values, its typography, and its four npm dependencies. Colour comes from
`DESIGN.md` §1.5's mapping table; dependencies are replaced per §2.

The catalogue is 16 real products across four categories (§4). The cart is
client-side only and never implies a transaction. Every price is a marked
placeholder. Nothing on the page is invented to fill a layout — where there is
no approved content for a slot, the slot ships a `[TODO: client]` marker and
§14 records what is missing.

Read §1 before anything else.

---

## 1. Non-negotiables

Every one of these outranks layout parity with the reference kit.

1. **Mobile-first.** The <768px layout is the *primary* design. Build and verify it before any desktop grid work. The audience is mid-tier Android on mobile data in Bangladesh.
2. **Every scroll effect has a defined "off" state** that still communicates the product.
3. **No AI-generated image may carry a product claim.** Feature imagery is real product photography only.
4. **The navel cutout appears in the New Born section only.** Never elsewhere.
5. **No invented price.** Every price is a clearly-marked placeholder (§4.1) until the client supplies real figures.
6. **The cart never implies a real transaction.** No "Order confirmed", no reference number, nothing that reads as a completed purchase.
7. **No invented figure of any kind** — no rating, no review count, no percentage, no duration, no delivery threshold. This is why §6.5 replaces the reference kit's star rating instead of styling it.

---

## 2. Dependencies — add none

The reference kit imports `@headlessui/react`, `motion`, `clsx` and `@heroicons/react`. **Do not install any of them.** Four libraries against a 180 KB gzipped JS budget, for behaviour this codebase already implements natively, is not a trade worth making. Build each with the pattern already in the repo:

| Reference kit uses | Build it with |
|---|---|
| `RadioGroup` / `Radio` (Headless UI) | Native `<fieldset>` + `<input type="radio" class="peer sr-only">` and a `<label>` styled via `peer-checked:` / `peer-focus-visible:`. Keyboard behaviour and grouping come free; no JS. |
| `data-checked:` / `data-focus:` variants | `peer-checked:` / `peer-focus-visible:` |
| `motion` / `AnimatePresence` | CSS `@keyframes` in `globals.css` driven by `--dur-*` and `--ease-*`. `DESIGN.md` §5 has the per-effect table. |
| `clsx` | Template literals, as every existing component does. If a third component needs conditional joins, add a four-line local `cx()` in `src/lib/` — not a package. |
| `@heroicons/react` | Inline `<svg>` with `stroke="currentColor"`, as `Header.tsx`, `CartSidebar.tsx` and `ProductCard.tsx` already do. |
| `next/image` → `<img>` (the kit's own swap) | Keep `next/image`. The kit swapped it out only to be framework-agnostic; this is a Next app and the optimiser is already load-bearing against the §11 budgets. |

`gsap` and `lenis` are the only runtime dependencies beyond React and Next. No other package ships.

---

## 3. Design tokens

`DESIGN.md` §1–§5 are the single source for colour, type, spacing, radii and motion, and `src/styles/tokens.css` is where they live. **Do not add a token** — every value the storefront needs already exists. The one viewport-conditional token is `--section-rhythm` (§11.2).

**`DESIGN.md` §1.5 is the colour port.** It maps each of the reference kit's twelve semantic tokens to exactly one NeoCare token. When reference markup says `bg-surface-raised`, write the utility in that table's right-hand column. **No hex literal outside `tokens.css`.** No new token.

Two mappings in that table exist because the reference kit is wrong for NeoCare, not because of translation — read them before writing a colour: skeleton bars use `bg-ink-100` (not the panel surface), and icons at rest use `text-ink-500` (not `text-ink-300`, which fails WCAG 1.4.11 at 2.2:1).

`globals.css` needs one addition: the `@keyframes` for the spinner and the cart-row enter/exit, per `DESIGN.md` §5.

---

## 4. Product data — one catalogue

`src/lib/catalogue.ts` is the catalogue. Every product in every category lives
there, in one `Product` shape. `src/lib/sizes.ts` keeps the weight-band logic
(`recommendFor`, `centrality`, `WEIGHT_*`) and re-exports the diaper slice, so
every existing `@/lib/sizes` import resolves unchanged.
`src/lib/placeholderCatalogue.ts` is **deleted**.

The catalogue is 16 products: 5 diaper sizes, 5 adult (2 belt diapers, 2 pant
diapers, underpads), 4 wipes (baby 80/120/180 plus the adult wet towel), 2 face
wipes.

- **§4.1 Prices stay placeholders.** Integer poisha, round numbers, `// TODO: client — placeholder price, not confirmed` at the data source. The UI does not visually distinguish a placeholder price from a real one; the marker lives in code. No price ships to production unreplaced. `scripts/check-static.mjs` enforces that no price literal exists outside `catalogue.ts`.
- **§4.2 Every product is purchasable.** No "Coming soon" badge, no disabled add-to-cart anywhere. The cart is client-side and never implies a transaction (non-negotiable 6), so there is no reason to gate one category differently from another.
- **§4.3 Deduplication — one entry per unique physical product.** `../Media` holds five byte-identical `(1)` copies and three second crops of packs it already holds. A duplicate never becomes a second product. A byte-identical copy is dropped outright; a usable second crop of the same pack becomes that product's `gallery` entry, shown on its PDP only. `Media/NeoCare Baby Diaper Sizes Small Medium Large XL.png` is a Small 32-pcs pack and is deliberately **unused**: the catalogue has no 32-pack variant, and adding one would invent a SKU.
- **§4.4 Naming — no brand word.** Adult and Face Wipes photography shows Aspire, Lumera and Viva packaging: sister brands of Incepta, not NeoCare. Product names carry no brand word ("Adult Pant Diaper — M, 8 pcs"), while the packshot shows the pack exactly as photographed. **No packshot is retouched** to remove or add a mark. The three category pages carry `category.brandNote`, a `[TODO: client]` string naming the real brands, so the discrepancy is disclosed on the page and not only in a code comment. Confirm the treatment before launch (§14).
- **§4.5 The size finder uses real per-size photography.** All five sizes now have their own studio packshot, shot as one family, so the grid and the finder read as a set.
- **Parenting Journey** stages stay `#` placeholders. No products, no prices, no images.

---

## 5. The upper half

### 5.1 Promo bar

A full-width band above the header.

- Markup: one `<div>`, `bg-green-900 px-4 py-2 text-center type-small font-semibold text-fg-inverse`.
- **Not sticky.** It scrolls away; the header sticks beneath it. Do not wrap both in a sticky container.
- Content: `t.promo.text` — a new key, shipped as a `[TODO: client]` placeholder per §9. The reference kit's copy is a free-delivery threshold; NeoCare has no such offer and non-negotiable 7 forbids inventing one. **Do not write a delivery threshold, discount, or shipping promise into this bar.**
- When `t.promo.text` is an empty string, render nothing at all — no empty band.

`--nc-green-900` on `--color-text-inverse` measures 13.6:1.

### 5.2 Header

Keep everything `Header.tsx` already does: sticky, transparent over the hero then `bg-surface shadow-card` after 80px, the `<noscript>` solid-state fallback, the native `<details>` mobile disclosure, `SearchInput`, `CartButton`, `LanguageToggle`. Change only the bar's geometry and the cart affordance:

1. **Height 96px (`h-24`) at every width**, replacing `h-16 md:h-20`. This is the reference kit's single header height and it is what gives the upper half its air. The hero's negative top margin must change with it: `-mt-24` in place of `-mt-16 md:-mt-20`, one value now instead of two.
2. **Three-zone row:** `flex h-24 items-center justify-between`. Left zone `flex flex-1 items-center` holds the logo (mobile) or logo + nav (desktop, `hidden h-full space-x-8 lg:flex`). Right zone `flex flex-1 items-center justify-end` holds search, cart, language toggle, and the mobile menu disclosure.
3. **Nav items — do not add or remove:** Features · Our Products (Diapers Line, Adult Diapers, Baby Wipes, Face Wipes) · Parenting Journey (Conception, Pregnancy, New Born, Baby, Family) · New Born · Find your size · FAQ. Link targets: Diapers Line → `/products`, the other three → `/category/{slug}`, all of Parenting Journey → `#`.
4. **Nav link styling** becomes the reference kit's: `type-small font-semibold text-fg-muted hover:text-fg`, no pill background on hover. The current `text-brand hover:bg-surface-brand` treatment is replaced. Dropdown panels keep their existing `rounded-card` + `shadow-float` chrome.
5. **Cart affordance** becomes the reference kit's: icon plus a bare count, not a badge. `group -m-2 flex items-center p-2`; glyph `h-6 w-6 flex-shrink-0 text-ink-500 group-hover:text-fg-muted`; count `ml-2 min-w-3 type-small font-semibold text-fg-muted group-hover:text-fg`. Before hydration, render `ml-2 h-4 w-3 rounded-tight bg-ink-100` in the count's place — a skeleton the exact size of the digit, so the row does not shift when the count arrives. The count still needs `aria-live="polite"`.
6. **The cart icon still opens the drawer** (§7.1). It does not navigate.

### 5.3 Commerce page container

The product detail page and the cart page wrap their content in:

```
mx-auto max-w-2xl px-4 pb-16 sm:px-6 sm:pb-24 lg:max-w-7xl lg:px-8
```

**This container is for those two routes only.** The homepage keeps its current structure: full-bleed sections, each with its own `mx-auto max-w-(--container-content) px-4 md:px-6` inner container. Do not wrap the homepage in the commerce container, and do not widen the marketing sections to `max-w-7xl` — the two rhythms differ deliberately (`DESIGN.md` §7.1).

### 5.3a "Our Best Sellers" — the shop slot

`src/components/sections/BestSellers.tsx`.

Four cards, **one product per item in the header's "Our Products" dropdown**,
in dropdown order. `grid-cols-2 sm:grid-cols-4` — four divides evenly into
both, so neither breakpoint leaves a dead cell. Heading, one-line intro, and a
"See all" link through to `/products`, in §6.2's `flex items-end
justify-between` header row.

The four picks are **client-supplied** and live in `BEST_SELLER_KEYS`. This is
the one place a v3.1 heading makes a claim, so be exact about what it is and is
not: no rank, no units sold, no "#1" badge, no review count, nothing derived.
Non-negotiable 7 bars inventing a figure and none is invented — the heading is
the client's own editorial claim about their own catalogue. **If the client
withdraws the selection, the heading and the list go together.** Do not keep the
heading over a mechanically-chosen list.

### 5.4 Homepage section order

Promo bar · Header · Hero · **Best Sellers** · **Category rows** · Trust strip · New Born · Size selector · FAQ · Look Closer · Footer.

Scroll budget **≤ 900vh on mobile**; §11 carries the measured figures and the
reason the category rows do not render below 640px.

### 5.5 Category rows

`src/components/sections/CategoryRows.tsx`. One compact row per dropdown
category, directly below the best sellers, on `bg-surface-alt`.

- **Best sellers are excluded from their own row.** Repeating the four cards
  immediately beneath themselves is duplication, and it is what put the
  "best sellers plus full category sections" option out of budget.
- Each row shows the next **3** products the visitor has not already seen, then
  links to the category page where §6.2a lists every product, best seller
  included.
- A category with nothing left to show renders **nothing at all**, heading
  included. An empty labelled section is worse than no section.
- Headings reuse the approved dropdown labels via `categoryLabel`. Do not add
  four content keys that would say the same thing.
- Face Wipes holds two products, so its row shows exactly one. That is the
  honest state of the catalogue — §6.2a centres a lone card rather than leaving
  dead cells beside it.
- **Rendered at every width, mobile included.** The rows were `hidden sm:block`
  in the first v3.1 cut because they cost 226vh into 15vh of headroom. §11.2
  recovered that headroom rather than hiding the section; see §5.6.

---

### 5.6 Look Closer on mobile — numbered anatomy, not a carousel

`src/components/sections/ProductSequence.tsx`. Below **768px** the section is a
labelled product photograph above a numbered vertical list. Above 768px nothing
changes: the pinned GSAP sequence and its unpinned off-state are untouched.

**Desktop works because an arrow points from the active callout to that part of
the diaper.** Strip the pin and the arrow and that link disappears — which is
what mobile had. The numbers restore it: marker `n` on the photograph and row
`n` in the list are the same feature, so a reader can see which part is being
described without an arrow, a pin, or a gesture.

Rules:

- **Two aspect ratios, because `<picture>` serves two differently-shaped
  images.** The GIF is 1200×1698 portrait; the mobile still is 720×560
  landscape. `aspect-[720/560] md:aspect-[1200/1698]`, and the `<img>` declares
  **720×560** — the still's own intrinsic size, not the GIF's.
- **`FEATURE_MARKERS` is not `FEATURE_ANCHORS`.** Markers are measured against
  the still frame; anchors are guesses against the rotating GIF. Two different
  images, so a value correct for one is wrong for the other. **Do not merge
  them.** Markers are derived from the centre of each feature's own
  `FEATURE_CROPS` window in `scripts/build-assets.mjs`, mapped through the same
  `.trim({threshold:12})`, so a marker lands where its close-up was taken.
- **Markers are not interactive and are `aria-hidden`.** A tap target must do
  something, and the only sensible something — reveal that feature's text — is
  already unconditionally visible below. Announcing five bare numerals ahead of
  the list would be noise (§10). Verified: all five clear 44px with no overlap,
  worst separation 67px at the 361px render size.
- **No card chrome below md.** Five bordered, shadowed boxes stacked read as
  five separate objects when they are one list. A hairline divider says the
  same for no pixels, and it bought Bangla 25vh (§11.2).
- **The five close-up photographs are hidden below md.** Each is a crop of the
  diaper shown whole a few hundred pixels above, so on a phone the section
  repeated one photograph five times. `sizes` declares `1px` below md so
  `next/image` never fetches them there. (The pinned desktop path already hid
  them — `globals.css` `.seq-root[data-pinned='true'] .seq-card-media`.)
- Every `md:` class restores the stacked column exactly. §1 non-negotiable 2's
  off-state (guards failed, no GSAP, ≥768px) depends on it.
- **The arrow is gated twice** — `canAnimate &&` in JSX and `hidden md:block`
  on the SVG. `canAnimate` is client state, and a stale hot reload can leave it
  true on a phone: an arrow was reported alongside these markers, which a cold
  load cannot produce. Keep both gates.
- **Each row reveals as it enters the viewport**, via `Reveal`. Its failsafe
  must stay visibility-checked; a time-based one reveals this whole section
  ~3000px before it can be seen (CLAUDE.md).

**A horizontal card row was tried here and withdrawn.** It clipped the peek
card mid-word, which reads as broken rather than as an affordance; and a
swipe-only carousel is the wrong pattern for main content — see §6.2a.

---

## 6. Products

### 6.1 Product card

`src/components/product/ProductCard.tsx`. Keep its current props, quick-add gate, and `AddToCartButton` nesting. Change:

1. **Tile radius `rounded-tight` → `rounded-soft`** (12px, matching the kit's `rounded-xl`). Apply in all three places the product tile appears: `ProductCard`, the PDP gallery image (§6.3), and the `/category/{slug}` placeholder cards.
2. **Remove the hover scale on the image.** `group-hover:scale-105` goes; the reference kit has no hover transform anywhere and `DESIGN.md` §8 forbids one on commerce surfaces. The card's affordance is the quick-add reveal, which is enough.
3. Everything else stays: `aspect-square`, `border border-hairline`, `bg-surface-alt`, `object-contain p-8`, name at `type-body font-semibold text-fg`, price at `type-body text-fg-muted`, quick-add as a `h-9 w-9 rounded-pill` icon button at `absolute bottom-3 left-3`, always visible below `sm` and `opacity-0 sm:group-hover:opacity-100` above it.

`object-contain`, not `object-cover`: the diaper photography is a cutout, and cover would crop the product.

### 6.2 Product grid

`src/components/sections/ProductGrid.tsx` — the Diapers Line page at `/products`. Heading and intro grouped in one `<div>` laid out `flex items-end justify-between`, then `grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3` over all five sizes. No pagination and no "View all": the grid renders that whole category, so the link would point at an identical list. Content keys `shop.title` / `shop.intro` / `shop.quickAdd`.

### 6.2a `ProductCards` — the shared card list

`src/components/product/ProductCards.tsx`. Used by §5.3a, §5.5 and the category
pages. `ProductGrid` (§6.2) is untouched and still owns `/products`.

**Column count is derived from card count**, never fixed at three: 1 → centred
at card width, 2 → `grid-cols-2`, 3 → `grid-cols-2 sm:grid-cols-3`, 4 →
`grid-cols-2 sm:grid-cols-4`. A fixed three-column grid would leave dead cells
for Face Wipes and for any one-card row, which is a planning error rather than
a design choice.

**Two layouts:**

- `grid` (default) — mobile stays two-up. One card per row cost 204vh for a
  single section at 375px, which is why it is not the default. Used
  where the section is the page: the category pages and the best-seller grid.
- `scroller` — one swipeable row on mobile, grid from 640px up. **Browse rows
  only (§5.5).** Never for main content: a swipe-only carousel hides content
  behind a gesture, and content the visitor did not ask for is the only kind
  that may cost nothing to miss. §5.6 tried it on the five product features and
  withdrew it.
  It is a real overflow region, so it takes `tabIndex={0}` and an accessible
  name: WCAG 2.1 requires a scrollable region to be keyboard-operable, and a
  scrolling `div` is not focusable by default (§10).

The packshot keeps `alt=""` from §6.1. The product name is visible text inside
the same link, so a described image would announce the product twice.

### 6.3 Product detail page

`src/app/[lang]/product/[slug]/page.tsx`. Replace the current two-column `md:grid-cols-2` layout with the reference kit's 12-column gallery-overlap grid.

**v3.1 — the route covers the whole catalogue.** `generateStaticParams` runs
over `PRODUCTS`, not the five diaper slugs. Everything diaper-specific is gated
behind `isSizeRow(product)`, and the gate is a correctness requirement rather
than a layout preference:

| Gated behind `isSizeRow` | Why |
|---|---|
| The five `FEATURE_IMAGES` | They are close-ups of the NeoCare diaper. The diaper is identical across sizes, so showing them on any *size's* page is accurate. On a wipes or adult-diaper page they would attach a product claim to photography of a different product — non-negotiable 3. |
| The five feature bullets | The same claim in text form. |
| The weight range in the facts row (§6.5) | Baby-diaper sizing. Nothing else in the catalogue is weight-banded. |
| `SizeRowChips` (§6.4) | Same. |
| "Not sure which size? Use the size finder" | The finder covers diapers only. |

A non-diaper product shows, in its place, a link back to its category listing.

`Product.gallery` carries further **real photography of that same product** — a
second crop of the same pack (§4.3). Nothing is generated, upscaled, mirrored
or recoloured to fill a grid cell, and a product with no second crop simply
renders fewer tiles. `public/newborn/cutout-flatlay.*` stays out entirely: the
navel cutout appears in the New Born section only (non-negotiable 4).

**Page shape:**

```
lg:grid lg:auto-rows-min lg:grid-cols-12 lg:gap-x-8
  header   → lg:col-span-5 lg:col-start-8
  gallery  → mt-8 lg:col-span-7 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:mt-0
  controls → mt-8 lg:col-span-5
```

DOM order is header, gallery, controls — the grid placement puts the gallery on the left visually while the product name stays first in the reading order. Do not reorder the DOM to match the visual layout.

**Header block:** `<h1>` (product name) and price in a `flex justify-between`, both `type-h3 font-semibold text-fg`. Then the facts row (§6.5) at `mt-4`.

**Gallery:** inner grid `grid-cols-1 lg:grid-cols-2 lg:grid-rows-3 lg:gap-8`. First image `lg:col-span-2 lg:row-span-2`; every subsequent image `hidden lg:block`. All images `rounded-soft border border-hairline`, `object-contain` on `bg-surface-alt`.

**Which images may appear — non-negotiable 3 applies.** Image one is `SizeRow.image` (the Medium pack render, or the product cutout). Images two onward come **only** from `public/product/features/*.webp` — the five real close-up crops of the actual product, already captioned in `en.json` as `features.*.imageAlt`. Pass them with those existing alt strings.

- These crops are real photography of the real diaper, which is identical across sizes, so showing them on any size's page is accurate.
- **Do not present them as alternate angles of the pack**, and do not generate, upscale, mirror or recolour an image to fill a grid cell.
- `public/newborn/cutout-flatlay.*` stays out of the gallery entirely — the navel cutout appears in the New Born section only (non-negotiable 4).
- If fewer than three images are available for a product, the inner grid renders what exists and the `lg:grid-rows-3` track collapses; the controls column then sets the row heights. That is the correct degradation — do not pad the grid.

**Controls column, in this order,** with the spacing from `DESIGN.md` §3.1:

1. **Size row** (§6.4) — the five sizes as cross-links.
2. **Pack row** (§6.4) at `mt-8` — the product's pack variants.
3. **Add to cart** at `mt-8` — `AddToCartButton`, full width, the §6.1 primary-CTA shape from `DESIGN.md` §6.1.
4. **Description** at `mt-10` — `type-small font-semibold text-fg` label, body at `mt-4 type-body text-fg-muted`.
5. **Feature bullets** at `mt-8 border-t border-hairline pt-8` — label, then `list-disc space-y-1 pl-5 type-body text-fg-muted marker:text-ink-300`, each `<li>` with `pl-2`.
6. **Back to the size finder** — the existing `pdp.backToFinder` link, `type-small font-semibold text-brand hover:underline`.

`generateStaticParams` over the five slugs. Fully static, no data fetching. Keep `priority` on the first gallery image only.

### 6.4 Size row and pack row — the two picker slots

The reference kit stacks a colour picker over a size picker. NeoCare has neither axis in that form, and inventing one is forbidden. Both slots are filled with real navigation and real variants:

**Size row** — label `pdp.sizeLabel`, then all five sizes as chips. The current product's chip renders in the selected state; the other four are `<Link>`s to their own product pages. This is cross-navigation wearing the kit's chip row, and it earns the slot: a visitor who landed on Large from search can reach Medium without going back to the grid.

**Pack row** — label `pdp.choosePack`, then one chip per entry in `SizeRow.packs`, each showing the pack count and its price. Radio-group semantics (§2's native-radio pattern); the first pack is selected by default. This replaces the current stacked `rounded-card` bordered rows, which do not match the kit.

Chip styling for both rows, per `DESIGN.md` §6.4: `grid grid-cols-3 gap-3 sm:grid-cols-5`, chip `rounded-pill border border-hairline bg-surface px-3 py-3 type-small font-semibold uppercase text-fg sm:flex-1`, hover `bg-surface-brand`, selected `border-transparent bg-brand text-fg-inverse hover:bg-brand-hover`.

`uppercase` is written verbatim; the `[lang="bn"]` rule in `globals.css` neutralises it on `/bn`. **Never fix a chip width** — `sm:flex-1` only. "New Born" is three times the width of "XL" before Bangla adds 15–30%.

### 6.5 Facts row — the rating slot

The reference kit's rating row is value · five stars · `·` · review count. **NeoCare has no rating or review data and will not fabricate either** (non-negotiable 7). Keep the row's position and metrics; replace its content with the product's real facts:

```
{weight range}  ·  {pack sizes} pcs
```

- Position `mt-4` under the header block, all `type-small`.
- Weight range from the existing `sizes.weightRange` template. Pack sizes from `SizeRow.packs`.
- Separator: a `·` at `ml-4`, `text-ink-300`, `aria-hidden="true"`.
- No `<StarIcon>`, no `--color-rating` token, no review count, no "See all N reviews" link.

### 6.6 Size selector section

`SizeSelector`'s range input, `recommendFor` logic, `aria-valuetext`, numeric readout and alternate-size chips all stay. Its recommended-size card keeps its `AddToCartButton` and its "View details" link to the PDP. Its chips move to the §6.4 styling so the two chip rows on the site match; nothing else changes.

---

## 7. Cart

### 7.1 Cart drawer

`CartSidebar.tsx` stays. The header cart icon opens a drawer, not a page — that is existing, signed-off behaviour and the reference kit has no header-cart pattern to contradict it. The native `<dialog>` + `showModal()` construction stays: it gives focus trapping and `Escape`-to-close for free.

Restyle its internals to the reference kit's anatomy:

- **Row list:** `-my-6 divide-y divide-hairline`, each row `flex py-6`. The `-my-6` is load-bearing — without it the first row sits 24px below the panel edge (`DESIGN.md` §3.1).
- **Row layout:** `size-24` thumbnail at `rounded-tight border border-hairline`, then `ml-4 flex flex-1 flex-col`. Inside: title and line price in a `flex justify-between text-base font-medium` → `type-body font-semibold text-fg`; pack label at `mt-1 type-small text-fg-muted`; then `flex flex-1 items-end justify-between type-small` holding the quantity on the left and the Remove button on the right.
- **Quantity stepper** keeps its current `rounded-pill border border-hairline` group, real `<button>`s with `aria-label`s, and `aria-live="polite"` on the value.
- **Remove** becomes the inline text button from `DESIGN.md` §6.1: `font-semibold text-brand hover:text-brand-hover disabled:opacity-70`, with the `gap-2` spinner slot.
- **Missing thumbnail** falls back to a `bg-surface-alt` box with the cart glyph at `text-ink-500` centred in it.
- **Empty state** keeps its current copy (`cart.emptyTitle`, `cart.emptyBody`, `cart.continueShopping`); the glyph moves to `text-ink-500`.
- Row enter/exit uses the CSS keyframes from `DESIGN.md` §5, not a motion library.

### 7.2 Cart page — the 7/5 layout

The reference kit's cart is a full page: an item list beside an order-summary panel. **`src/app/[lang]/checkout/page.tsx` takes that layout.** It is already the route the drawer's CTA points at, and its job — show what is in the cart, take no payment — is exactly the reference cart page's job.

```
lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16
  cart list → lg:col-span-7
  summary   → mt-16 lg:col-span-5 lg:mt-0
```

`lg:items-start` is required, or the panel stretches to the list's height.

**Cart list section:** `<h1>` at `mb-8 type-h3 font-semibold text-fg`, then `border-t border-hairline pt-8`, then a `flow-root` wrapping the same row list as §7.1. Rows are shared between the drawer and this page — extract `CartItemRow` once, use it in both.

**Order summary panel:** `mt-16 rounded-soft bg-surface-brand px-6 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8`, no shadow.

- `<h2>` at `type-body-lg font-semibold text-fg`.
- **The CTA slot at `mt-6`, above the line items.** This ordering is the kit's and it is deliberate.
- Line items at `mt-6 space-y-4`, each `flex items-center justify-between`, every row after the first prefixed `border-t border-hairline pt-4`. Label `type-small text-fg-muted`, value `type-small font-semibold text-fg`.
- Total row separated the same way, both sides `type-body font-semibold text-fg`.
- Centred "or Continue shopping" at `mt-6 type-small text-fg-muted`, link `font-semibold text-brand hover:text-brand-hover`.
- Muted text inside the panel resolves to `--nc-ink-700` via the `.bg-surface-brand` rule — do not override it.

**The CTA slot holds the placeholder, not a checkout button.** Non-negotiable 6: nothing on this page may imply money changed hands or an order was placed. Render `checkout.notLive` in the CTA slot's position, styled as static copy — not as a disabled button, which reads as "temporarily unavailable" rather than "not built". No form fields. No "Proceed to checkout" button anywhere on this page. `checkout.backToShopping` stays.

**Judgment call, flagged rather than made silently:** the reference kit's cart page and NeoCare's checkout page are merged into this one route rather than shipped as two (`/cart` for the list, `/checkout` for payment). Two routes would mean a `/checkout` that exists only to say it does not work. If the client wants the split anyway, say so and it goes in — `/cart` gets this layout with a "Proceed to checkout" button, `/checkout` keeps the placeholder page.

**Summary rows.** Subtotal is real, summed via `lib/cart.ts`. Shipping renders `cart.shippingNote` as its value, not a figure — non-negotiable 7 forbids a delivery cost the client has not confirmed. Total equals subtotal until a real shipping figure exists. **Do not add a tax row**; no VAT treatment has been confirmed.

### 7.3 Cart state

`CartContext` + `localStorage`. Items are `{ sizeKey, pack, quantity }[]`. Persist on every change, hydrate on load, guard the SSR mismatch the way `Header.tsx` already guards client-only state. Cart math stays in `lib/cart.ts` and stays tested.

---

## 8. Skeletons

Every `<Suspense>` fallback is a hand-built skeleton matching the real node's box: same borders, same radii, same widths, bars filled `bg-ink-100` with `animate-pulse`.

- **Cart row skeleton:** `-my-6 divide-y divide-hairline` list, one `flex animate-pulse py-6` row, `size-24 rounded-tight border border-hairline bg-ink-100` thumbnail, then bars at `h-5 w-24` / `h-5 w-20` / `h-4 w-32` / `h-4 w-16` / `h-4 w-14` in the row's own positions.
- **Order summary skeleton:** `mt-6 space-y-4`, one `flex items-center justify-between` per row with `h-5 w-24` and `h-5 w-16` bars, rows after the first prefixed `border-t border-hairline pt-4`, total row at `h-6`.
- **Header cart count skeleton:** `ml-2 h-4 w-3 rounded-tight bg-ink-100` (§5.2).

**No spinner for a page-level load.** A spinner appears only inside a control the visitor just activated — add-to-cart, remove-from-cart. Measure the loaded node and copy its dimensions; a mismatched skeleton costs CLS against §11.

---

## 9. Content keys

Everything already in `src/content/{en,bn}.json` keeps its current wording. **Do not reword an approved string to fit a layout.**

Six keys are new. Ship each `[TODO: client]`-marked, and ship the Bangla side `[BN]`-prefixed — **do not machine-translate**.

| Key | Purpose | Ship as |
|---|---|---|
| `promo.text` | promo bar (§5.1) | `[TODO: client]` — no offer, threshold or shipping promise may be invented |
| `pdp.sizeLabel` | size row label (§6.4) | "Size" / `[BN]` |
| `pdp.descriptionTitle` | description block label (§6.3) | "Description" / `[BN]` |
| `pdp.description.{sizeKey}` | per-size description body (§6.3) | `[TODO: client]` — one per size. No performance claim, no absorbency figure, no duration. |
| `cart.total` | order-summary total row (§7.2) | "Total" / `[BN]` |
| `cart.shippingLabel` | order-summary shipping row label (§7.2) | "Shipping" / `[BN]` |

**Reused, not new:** the feature-bullets block (§6.3 item 5) takes its label from the existing `product.featuresTitle` ("The five features") and its five bullets from the existing `features.*.title` strings. Those are approved copy already on the page — reuse them rather than writing new bullet text.

---

## 10. Accessibility — WCAG 2.1 AA

Content keys:

- **Picker rows** are `<fieldset>` + native radios with an `aria-label` on the fieldset. Arrow-key traversal and group semantics come from the platform. The size row's four cross-links are links, not radios — a chip that navigates must be a `<Link>`.
- **Focus ring** is `focus:ring-2 focus:ring-ring focus:ring-offset-2` on every commerce control, over the global `:focus-visible` floor.
- **PDP DOM order** is header → gallery → controls, so a screen reader hears the product name before the images regardless of the visual grid placement.
- **Decorative marks** — the `·` separator (§6.5) and list bullets — carry `aria-hidden="true"`.
- **Cart drawer** stays focus-trapped, `Escape`-closable, returns focus to the cart button, `role="dialog"` with an `aria-label`.
- **Cart badge and "item added"** stay `aria-live="polite"`.
- **Quantity steppers** stay real buttons with `aria-label`s.
- **Search results popover** stays keyboard-navigable.
- **Contrast** — `DESIGN.md` §1.6. Sample real rendered pixels for the promo bar, the order-summary panel's muted text, and the header nav's `text-fg-muted` on the transparent-over-hero state. That last one is the risk case: `--nc-ink-500` over a 45%-opacity photo is not the same measurement as on white.

---

## 11. Performance gates

| Metric | Budget | Measured |
|---|---|---|
| LCP, Slow 4G / mid-tier Android | ≤ 2.5s | not yet measured on hardware |
| JS, gzipped — **mobile** | ≤ 180 KB | **152.2 KB** ✓ |
| JS, gzipped — desktop | see note | 200.2 KB |
| Hero image | ≤ 180 KB | **29.9 KB** ✓ |
| Turntable total | ≤ 1.5 MB, desktop only, lazy | 339 KB, desktop only ✓ |
| Bangla font, one weight | ≤ 100 KB | 54.2 KB, both fonts ✓ |
| Total, first view — mobile | ≤ 1.2 MB | **507.2 KB** ✓ |
| Homepage scroll — mobile | ≤ 900vh | **847vh en / 867vh bn** ✓ |
| Homepage scroll — desktop | see note | 1583vh en / 1621vh bn |
| Homepage scroll — tablet | see note | 1440vh en / 1461vh bn |

> Of the mobile payload, ~105 KB is the eleven packshots the category rows show
> at 375px. They are `loading="lazy"`, but Chrome's own near-viewport threshold
> pulls them in before they are swiped to. Left as-is: fighting the browser's
> heuristic would mean shipping JS to save 105 KB while 700 KB under budget.

> **The JS budget is read against mobile**, which §1 non-negotiable 1 defines as
> the primary experience. Desktop measures 199.9 KB because it additionally
> loads the guarded GSAP/Lenis chunk for the Look Closer sequence — 48 KB that
> `lib/motion.ts` fetches only after the §6 degradation guards pass, and that
> mobile never requests. That is the architecture working as designed, not a
> regression — it is the cost of the Look Closer sequence, and only desktop pays it.
>
> **The 900vh scroll budget is likewise a mobile gate.**
> On desktop the pinned Look Closer sequence alone occupies 850vh
> (`SEQUENCE.totalVh` 750 plus the 100vh pinned viewport), so 900vh cannot be
> met there without deleting a section outright. Mobile, where the sequence is unpinned, passes.
>
> Set against measured figures
> rather than by relaxing a gate that was simply missed.

### 11.1 Packshots bypass the image optimizer

`catalogue.servesOriginal(product)` returns true for any packshot whose
intrinsic width is ≤ 400px, and every surface that renders `product.image`
passes it to `next/image`'s `unoptimized` prop.

The packshots are supplied at 300×300 (a few at 330×300), and
`scripts/build-assets.mjs` already emits them as tuned WebP at 5–19 KB. Asking
the optimizer for a `w=384/640/750` variant makes it **upscale a 300px source**.
Measured on `adult-wet-towel`: the w=640 variant is 5,382 bytes against the
original's 6,344 — no meaningful saving, for a re-encode per width per format,
on a landing page that renders eleven of them.

| Homepage, desktop | `/_next/image` requests |
|---|---|
| Before §11.1 | 14 |
| After §11.1 | **0** |

It is also the right resolution: a card is ~160 CSS px on a 375px screen, which
is 320px at 2× — 300px native lands almost exactly there.

**The threshold is a width, not a flag.** A future higher-resolution packshot
goes back through the optimizer automatically, which is where it belongs.

> Found while investigating a `waitUntil: 'networkidle'` hang in the desktop
> Playwright run. The trigger was a poisoned `.next/cache/images` entry — a
> request aborted mid-write leaves a cache key that blocks every later request
> for it, permanently, until the directory is cleared. **If an image request
> hangs forever while `curl` serves the same URL fine, delete
> `.next/cache/images` and restart before looking anywhere else.**

### 11.2 Mobile scroll budget — how the 900vh was won back

v3.1's first cut measured 1111vh at 375px with §5.5's category rows visible,
against a 900vh gate. Hiding them below 640px met the gate but cost mobile the
section. The gate was met properly instead, by fixing four things that were
each independently wrong:

| Fix | Saved |
|---|---|
| **Mobile section rhythm.** `--section-rhythm` is a viewport-HEIGHT clamp, so on a 812px phone it resolved to 81px of `padding-block` — 162px between every adjacent pair of sections, 835px (103vh) across the homepage. Below 768px it is now a flat 44px. Desktop untouched. | ~46vh |
| **Category row headings wrapped.** Heading plus a long "See all {category}" link did not fit 343px, so each of the four rows spent 87px on two stacked lines. The link shortens to `shop.seeAll` below sm — the category name is already in the heading beside it — and the heading steps down one size. Now 38px. | ~15vh |
| **The lone Face Wipes card rendered at 320px.** A one-card row fell through to the grid branch's `mx-auto max-w-xs`, which is right on a category PAGE and wrong inside a scroller row, where it capped the whole row's width and produced a 320px-tall image. `SCROLLER_COLUMNS` is now `sm:`-prefixed only and may never set a width. | ~32vh |
| **Look Closer stacked five full-width photo cards** (§5.6). | ~171vh |

Then §5.6 replaced that row with the numbered anatomy list, which costs ~12vh
more than the row did and is worth it (the row clipped text and hid main
content behind a gesture). Two things paid for it: the stage's 230px of dead
space went when its aspect ratio was corrected, and the mobile card chrome came
off. Bangla is the binding locale — it ran 893vh before the chrome came off.

Result at 375px: **859vh en / 879vh bn** ✓, with 21vh of headroom.

> **Re-measure Bangla, not English, when touching this page.** Bangla runs
> ~20vh longer, so English passing says nothing.

> **`--section-rhythm` is the one to watch.** It is defined in `vh`, so it
> scales with viewport HEIGHT — the axis that has nothing to do with how much
> air a layout needs. On a phone it bought the least and cost the most. If a
> future token is spaced in `vh`, measure it at 375×812 before trusting it.

### 11.3 Notes

§2's no-new-dependencies rule is what keeps the JS budget reachable. The PDP gallery is the new risk: up to six images per page. Every gallery image past the first is `hidden` below `lg`, so it must not be fetched on mobile — size it with `sizes` and let `next/image` skip it, and verify on a real 375px viewport that only one image is requested.

---

## 12. Acceptance criteria

- [ ] Mobile (375px) reviewed and approved for the promo bar, header, product grid, PDP and cart page before any desktop polish
- [ ] Only one gallery image is requested at 375px
- [ ] Page usable with JS disabled — cart and search degrade to "unavailable", no dead click targets
- [ ] `prefers-reduced-motion` renders end states and animates nothing
- [ ] No hardcoded hex outside `tokens.css`
- [ ] No new npm dependency (§2)
- [ ] Both locales render; `[BN]` and `[TODO: client]` markers visible where copy is pending
- [ ] No star rating, review count, or rating figure anywhere (§6.5)
- [ ] No delivery threshold, shipping cost, discount or tax figure anywhere (§5.1, §7.2)
- [ ] Every price is a marked placeholder until the client confirms (§4.1)
- [ ] Navel cutout appears in the New Born section only
- [ ] Gallery images past the first come only from the product's own `gallery` crops, plus `public/product/features/` **on a diaper page only** (§6.3)
- [ ] No product appears twice anywhere in the catalogue (§4.3)
- [ ] No packshot is retouched to remove or add a brand mark (§4.4)
- [ ] Every one of the five diaper sizes shows its own pack photograph, in the grid and in the size finder (§4.5)
- [ ] No `/_next/image` request is issued for a ≤400px packshot (§11.1)
- [ ] Checkout page never implies a completed transaction
- [ ] No hover transform on any commerce surface (§6.1, `DESIGN.md` §8)
- [ ] Every chip and button width is intrinsic or `flex-1` — none fixed to English text
- [ ] `uppercase` neutralised on `/bn`, verified in the browser
- [ ] Cart math correct and covered by tests
- [ ] Total homepage scroll ≤ 900vh **on mobile** (§11); the category rows stay `hidden sm:block` and the figure is re-measured whenever a homepage section is added
- [ ] Keyboard-only traversal reaches every control, including the drawer and both picker rows
- [ ] Contrast sampled on rendered pixels for the three cases in §10
- [ ] Performance gates met on real hardware

---

## 13. Explicitly out of scope

- Real payments, real checkout, order confirmation, emails, SMS.
- Any backend, database, or CMS for products, orders or inventory.
- User accounts, login, order history.
- `commerce-kit`, Stripe, or any commerce SDK.
- The four npm dependencies the reference kit ships with (§2).
- The reference kit's colour values and typography — layout only (§0).
- A star rating or review system (§6.5).
- ~~Real Adult Diapers / Baby Wipes / Face Wipes photography, inventory or purchasable products (§4.2).~~ **In scope as of v3.1** — real photography and real products now exist for all three (§4).
- Retouching, re-shooting or re-branding any supplied packshot (§4.4).
- Inventing a SKU that has no packshot, or a pack size that has no confirmed count (§4.3, §14).
- Products or pages for Parenting Journey (§4).
- Footer changes. The reference kit's footer grid is not ported.

---

## 14. Stop and ask

1. **Promo bar copy** (§5.1) — no offer supplied, and none may be invented. The bar ships empty-or-placeholder until the client writes it.
2. **Real prices** for each size and pack (§4.1) — needed before production.
3. **Per-size PDP descriptions** (§9) — no approved copy exists.
4. **Shipping cost and tax treatment** (§7.2) — the summary shows a note, not a figure, until both are confirmed.
5. **Whether to split `/cart` from `/checkout`** (§7.2) — merged by default.
6. **"Trusted since [year]"** in the trust strip — no year supplied.
7. **Size ranges** — taken from the live site, overlaps unconfirmed.
8. **FAQ answers** — several restate policy that may be stale.
9. **`holdFrame` index** for Look Closer — depends on the real turntable.
10. **Any performance figure** for any feature or product. Never invent one.
11. **Real prices** for the eleven non-diaper products (§4.1).
12. **Brand treatment for the non-NeoCare products** (§4.4). Adult products are Aspire, face wipes are Lumera and Viva — sister Incepta brands. v3.1 names them without a brand word while the packshot shows the real pack. Confirm whether that is the intended treatment, whether the brands should be named in the copy, or whether they belong on a NeoCare site at all. `category.brandNote` carries this on the page.
13. **The four "Our Best Sellers" picks** (§5.3a) — client-selected 23 August 2026 as Medium 50 pcs, Adult Pant Diaper M 8 pcs, Baby Wipes 120 pcs, Refreshing Wipes. Confirm they still hold before launch, and confirm the heading itself: it is an editorial claim, and §1 non-negotiable 7 means the build will not derive one.
14. **Pack counts on the two face-wipe packshots.** Illegible at the supplied 300px. 25 is carried as a placeholder under §4.1's convention — shown plainly, marked in code. Confirm both figures.
15. **Whether a Small 32-pcs pack is a real SKU** (§4.3). `Media` holds a packshot of one; the catalogue has no 32-pack variant and will not invent one. If it is real, it needs a price and a pack entry.
16. **Marker placement for features 1 (SAP) and 3 (Ear)** (§5.6). Each marker sits where its own close-up crop was taken, but neither feature is literally visible there: the absorbent polymer is inside the core, and the crop framed the back waistband rather than the side ear. The numeral is a reference to the list row, not a claim that the feature is visible at that pixel — but confirm the placement, or supply a cutaway that shows the core honestly.
17. **Higher-resolution packshots.** Every non-diaper product ships at 300×300. That is adequate for a card (§11.1) but is the ceiling for the PDP hero, which renders it at roughly 740px on desktop.
18. **Per-product PDP descriptions for the eleven non-diaper products** (§9) — `[TODO: client]` in both locales.
19. **Bangla names for the eleven non-diaper products.** Written, not client-approved — same standing as the rest of `bn.json`.

---

## 15. English copy — open findings

An audit of `src/content/en.json` produced these. **None is applied.** Each
would make `en.json` and `bn.json` diverge in wording until the Bangla is
re-translated, so decide them together and send both for review at once.
Key parity is unaffected either way.

### 15.1 Strings that are inaccurate as they stand

| Key | Now | Problem |
|---|---|---|
| `shop.intro` | "Real pack sizes, priced and ready to add to your cart." | "Priced" is not true — §4.1 makes every price a marked placeholder, so the copy asserts what the page does not deliver. "Real pack sizes" is also defensive: a customer reads "real" and wonders what was fake. |
| `cart.shippingNote` | "Shipping calculated at checkout." | This is the **value** of the Shipping row (§7.2), directly under copy saying checkout is not live. It promises a calculation that cannot happen, and states a policy §14 item 4 lists as unconfirmed. Should be a `[TODO: client]` note, not a promise. |
| `cart.checkout` | "Checkout" | The drawer's CTA. §7.2 merged `/cart` and `/checkout` into one route that takes no payment, so the button leads to a page whose whole message is that checkout does not exist. Non-negotiable 6 says the cart must never imply a real transaction, and this is the strongest such implication on the site. "View cart" was proposed. |

### 15.2 `newborn.galleryPrint1Alt` … `galleryPrint6Alt` — an accessibility defect

Six near-identical strings ("with colorful print design", "with playful print
pattern", …). A screen-reader user hears six variations of "diaper with a
print" and learns nothing that distinguishes them — the same as no alt text, at
six times the length. Neighbouring alts in the same section do it properly
("printed with an orange kitten character").

**Blocked, deliberately:** replacements are not proposed here because the
prints cannot be described accurately without looking at the six files, and
inventing a description of a product image is what non-negotiable 3 exists to
prevent. Someone must open `public/product/prints/` and write what is on them.

(`colorful` is also the only US spelling in the file; everything else is en-GB.)

### 15.3 Eight dead content keys

Verified unreferenced across `src/`, statically and via dynamic lookup:
`nav.home`, `nav.closeMenu`, `hero.imageAlt`, `newborn.imagePending`,
`newborn.lifestyleAlt`, `newborn.galleryFastenerAlt`, `checkout.title`,
`checkout.backToShopping`.

Safe to delete from both locales. **Except** `newborn.lifestyleAlt` — it is
dead because the lifestyle photograph is not rendered, which may be an
oversight in the section rather than a dead string. Check before deleting.

### 15.4 Em and en dashes — optional

`design-taste-frontend` bans both in user-visible text. Affects `meta.title`,
`newborn.body`, `checkout.notLive`, `faq[1].a`, `faq[12].a` and `trust.since`.
This is house style, not correctness; the strings are grammatical as they
stand, and every one renders in Bangla too.

**Two to leave alone regardless:** `sizes.weightRange` ("For {min}–{max} kg")
and `newborn.badge` ("New Born · 0–4 kg"). The en dash there is a numeric
range, which is what an en dash is for — a hyphen makes "0-4" read momentarily
as subtraction, in the three places a misread number matters most on a
baby-care site.

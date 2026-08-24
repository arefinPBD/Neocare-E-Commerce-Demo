# NeoCare — Design System
**Design system** · companion to `BUILD_SPEC.md`

Colours sampled directly from `Medium_50pcs_01.png` and `Diaper 34 Mockup-02.jpg`. Not invented.

---

## 0. What changed in v2.0, and why

v1.0 defined NeoCare's **palette, type scale, spacing and motion** and left layout largely to the build spec. Those tokens were correct and are carried forward **unchanged** — §1 through §5 are byte-identical in intent to v1.0, and `src/styles/tokens.css` needs no edit.

What v2.0 adds is a **commerce layout layer**: the grid geometry, type hierarchy, spacing rhythm, radii, interaction states and motion of the storefront surfaces — header, product grid, product detail page, and cart — ported from the `shirt-shop` reference kit (`vercel/flags → examples/shirt-shop`, MIT).

The port is **structure only**. Every colour value in the reference kit is discarded and replaced by the NeoCare token that carries the same *role*. §1.5 is the complete mapping and is the single source for that translation — read it before reaching for a colour anywhere on a commerce surface.

Two things the reference kit assumes that NeoCare does not have, and how they resolve:

- **A star rating.** NeoCare has no review data and may not invent one (§12 of the build spec). The rating row's *layout slot* is kept and filled with the product's real weight range. There is no `--color-rating` token.
- **Colour swatches.** NeoCare diapers have one print per size. The swatch row's *layout slot* is kept and filled with the five real sizes as cross-links to sibling product pages. No swatch, no hue, no invented variant.

The marketing sections built in v1.0 (Hero, Trust strip, New Born, Size selector, FAQ, Look Closer, Footer) keep their v1.0 treatment. Where this document says "commerce surface", it means the four storefront surfaces only.

---

## 1. Colour

**Unchanged from v1.0.** `src/styles/tokens.css` is the only file in the project permitted to contain a hex literal.

### 1.1 Brand core

| Token | Hex | Source | Contrast on white |
|---|---|---|---|
| `--nc-green-900` | `#003A07` | Darkened from wordmark | 13.6:1 ✓ |
| `--nc-green-800` | `#004E0A` | **Packaging wordmark** | 10.0:1 ✓ |
| `--nc-green-700` | `#0A6B18` | Interpolated | 6.8:1 ✓ |
| `--nc-green-600` | `#009030` | **Leaf accent on pack** | 3.9:1 ⚠ |
| `--nc-sage-500` | `#629A7E` | **Pack wave band** | 3.3:1 ⚠ |
| `--nc-sage-300` | `#8CB69A` | Pack wave band | 2.3:1 ⚠ |
| `--nc-mint-200` | `#B6E0C4` | **Diaper dot print** | 1.5:1 ⚠ |
| `--nc-mint-100` | `#D2EEE0` | Diaper dot print | 1.2:1 ⚠ |
| `--nc-mint-50` | `#EFF8F3` | Derived surface | — |

### 1.2 Accent — use sparingly

| Token | Hex | Source | Contrast on white |
|---|---|---|---|
| `--nc-orange-600` | `#E6461E` | Darkened for contrast | 4.5:1 ✓ |
| `--nc-orange-500` | `#F0461E` | **Logotype on diaper** | 3.8:1 ⚠ |
| `--nc-gold-400` | `#FABE0A` | Logotype highlight | 1.8:1 ⚠ |

### 1.3 Neutrals

| Token | Hex |
|---|---|
| `--nc-ink-900` | `#141A16` |
| `--nc-ink-700` | `#3A443E` |
| `--nc-ink-500` | `#6B776F` |
| `--nc-ink-300` | `#A8B2AC` |
| `--nc-ink-100` | `#E3E8E5` |
| `--nc-paper` | `#FFFFFF` |
| `--nc-cream` | `#FBF9F5` |

### 1.4 Semantic

```css
--color-text            : var(--nc-ink-900);
--color-text-muted      : var(--nc-ink-500);
--color-text-inverse    : #FFFFFF;
--color-bg              : var(--nc-paper);
--color-bg-alt          : var(--nc-cream);
--color-bg-brand-soft   : var(--nc-mint-50);
--color-primary         : var(--nc-green-800);
--color-primary-hover   : var(--nc-green-900);
--color-accent          : var(--nc-orange-600);
--color-border          : var(--nc-ink-100);
--color-focus           : var(--nc-green-600);
--color-success         : var(--nc-green-700);
--color-error           : #B3261E;
```

### 1.5 Reference-kit token map — the translation table

The `shirt-shop` kit ships twelve semantic colour tokens. Each maps to exactly one NeoCare token. **This table is the whole colour port.** When the reference markup says `bg-surface-raised`, you write the NeoCare utility in the right-hand column — never a new token, never a hex.

| Reference token | Role in the kit | NeoCare token | Tailwind utility |
|---|---|---|---|
| `--color-surface` | page background | `--color-bg` | `bg-surface` |
| `--color-surface-raised` | order-summary panel | `--color-bg-brand-soft` | `bg-surface-brand` |
| `--color-surface-inverse` | promo bar | `--nc-green-900` | `bg-green-900` |
| `--color-fg` | headings, prices, chip text | `--color-text` | `text-fg` |
| `--color-fg-muted` | body copy, meta, footer links | `--color-text-muted` | `text-fg-muted` |
| `--color-fg-subtle` | list markers, `·` separators | `--nc-ink-300` | `text-ink-300` |
| `--color-fg-inverse` | text on inverse / on accent | `--color-text-inverse` | `text-fg-inverse` |
| `--color-line` | every hairline | `--color-border` | `border-hairline` |
| `--color-accent` | primary fill, link text | `--color-primary` | `bg-brand` / `text-brand` |
| `--color-accent-hover` | hover fill, hover link | `--color-primary-hover` | `bg-brand-hover` |
| `--color-accent-fg` | text on accent | `--color-text-inverse` | `text-fg-inverse` |
| `--color-ring` | focus ring | `--color-focus` | `ring-ring` |
| `--color-rating` | star fill | **no equivalent — omitted** | — |

Two additions the reference kit has no token for:

- **Skeleton bar fill** is `--nc-ink-100` (`bg-ink-100`), *not* the panel surface. `bg-surface-brand` is mint and reads as a deliberate colour block; a skeleton must read as absent content, which only a neutral does.
- **Icons at rest** (cart glyph, empty-state glyph) are `--nc-ink-500` (`text-ink-500`), *not* `--nc-ink-300`. The kit uses its subtlest neutral here, but a cart icon is a meaningful UI component and WCAG 1.4.11 puts the floor at 3:1 — `--nc-ink-300` measures 2.2:1 on white and fails it. `--nc-ink-500` measures 4.6:1. Reserve `--nc-ink-300` for genuinely decorative marks: list bullets and the `·` separator.

### 1.6 Contrast rules — enforce these

- **Body text:** `--nc-ink-900` or `--nc-green-800` only. Nothing else clears 4.5:1.
- **`--nc-orange-500`, `--nc-sage-500`, `--nc-green-600`:** large text (≥24px, or ≥19px bold), icons, borders, and UI components only. **Never body copy.**
- **`--nc-mint-*`:** backgrounds and decoration only. Never text.
- **Never** orange text on green, or sage on mint. Both fail.
- Focus ring: 2px `--color-focus` + 2px offset. Visible on every interactive element.
- **Tinted surfaces step muted text one stop darker.** `--nc-ink-500` measures 4.44:1 on `--nc-cream` and 4.32:1 on `--nc-mint-50` — both under AA. `globals.css` already redefines `--color-text-muted` to `--nc-ink-700` inside `.bg-surface-alt` and `.bg-surface-brand`. The order-summary panel sits on `bg-surface-brand`, so it inherits this automatically — do not hand-set a muted colour inside it.

---

## 2. Typography

**Latin:** Poppins. **Bangla:** Hind Siliguri. Both already loaded via `next/font` in the root layout.

```css
--font-latin  : 'Poppins', system-ui, sans-serif;
--font-bangla : 'Hind Siliguri', 'Noto Sans Bengali', sans-serif;
```

**Two weights per script only: 400 and 600.** The reference kit leans on `font-medium` (500), which NeoCare does not ship. Every `font-medium` in the reference markup becomes `font-semibold` (600); every unweighted run stays 400. Do not add a 500 weight to close the gap — Bengali cannot be safely unicode-range subset, so each extra Bangla weight costs a full 80–120 KB file against a 180 KB total JS budget.

### 2.1 Scale — unchanged

| Token | clamp() | Utility |
|---|---|---|
| `--text-display` | `clamp(2.5rem, 6vw, 4.5rem)` | `type-display` |
| `--text-h1` | `clamp(2rem, 4.5vw, 3.25rem)` | `type-h1` |
| `--text-h2` | `clamp(1.5rem, 3vw, 2.25rem)` | `type-h2` |
| `--text-h3` | `clamp(1.25rem, 2vw, 1.5rem)` | `type-h3` |
| `--text-body-lg` | `clamp(1.0625rem, 1.4vw, 1.1875rem)` | `type-body-lg` |
| `--text-body` | `1rem` | `type-body` |
| `--text-small` | `0.875rem` | `type-small` |

### 2.2 Commerce hierarchy — quiet, not loud

The reference kit's product page is deliberately understated: its product title is `text-xl font-medium` — the same size as the price beside it, and barely larger than body copy. NeoCare's v1.0 product page used `type-h1`, which at 3.25rem shouts over the photograph. **v2.0 adopts the quiet hierarchy on commerce surfaces.** Marketing section headings keep `type-h1`.

| Role | Utility | Notes |
|---|---|---|
| Product name (PDP `<h1>`) | `type-h3 font-semibold` | matches the price exactly |
| Price beside the product name | `type-h3 font-semibold` | same size, same weight, right-aligned |
| Cart page `<h1>` ("Your Cart") | `type-h3 font-semibold` | |
| Order-summary `<h2>` | `type-body-lg font-semibold` | |
| Section label — "Size", "Pack", "Description" | `type-small font-semibold` | |
| Product-grid section heading | `type-h1` | this is a marketing heading, stays loud |
| Cart row title, order total row | `type-body font-semibold` | |
| Product-card name | `type-body font-semibold` | |
| Product-card price | `type-body` | 400 weight, `text-fg-muted` |
| Body copy, descriptions | `type-body` | `text-fg-muted`, line-height from the `[lang]` fork |
| Meta, captions, promo bar | `type-small` | |

The global `h1, h2, h3 { font-weight: 600 }` rule in `globals.css` already produces the right weight for headings; `font-semibold` is written explicitly on non-heading elements that need it.

### 2.3 Line height — differs by script, unchanged

```css
[lang="en"] { --leading-tight: 1.12; --leading-normal: 1.55; }
[lang="bn"] { --leading-tight: 1.38; --leading-normal: 1.85; }
```

Bangla carries ascenders, descenders and conjuncts that clip at Latin leading. Not optional polish.

**Never set Bangla in all-caps or with `letter-spacing`.** `globals.css` enforces this with `[lang="bn"] * { letter-spacing: normal !important; text-transform: none !important }`. This matters directly here: the reference kit's size chips are `uppercase`. Write the `uppercase` class as the kit does — the enforcement rule neutralises it on `/bn` automatically, so Latin gets the kit's treatment and Bangla stays legible without a second code path.

---

## 3. Spacing

4px base, unchanged.

```css
--space-1:.25rem; --space-2:.5rem;  --space-3:.75rem; --space-4:1rem;
--space-6:1.5rem; --space-8:2rem;   --space-12:3rem;  --space-16:4rem;
--space-24:6rem;  --space-32:8rem;  --space-40:10rem;
```

Section vertical rhythm: `clamp(4rem, 10vh, 8rem)` (`section-rhythm`).
Content max-width: `--container: 1200px` (`--container-content`). Prose: `68ch` Latin, `60ch` Bangla (`measure`).

### 3.1 Commerce rhythm — coarse and repetitive

Inside a commerce surface the vertical scale is deliberately small and repeated, so the eye reads a rhythm rather than a series of one-off gaps. Five values do all the work:

| Gap | Value | Where |
|---|---|---|
| Label → its control | `mt-2` | "Size" heading → chip row |
| Inside a control group | `mt-4` | product title → weight-range row |
| Panel internals | `mt-6` | order-summary heading → CTA → line items |
| Between control groups | `mt-8` | size picker → pack picker → Add to cart |
| Major block break | `mt-10` | controls column → Description |

Two structural rules that go with it:

- **Divided section:** `border-t border-hairline pt-8` for a major break; `pt-4` for a row inside the order summary.
- **List rows:** `py-6` on each row with `divide-y divide-hairline` on the list, and `-my-6` on the list itself to cancel the first and last row's outer padding against the container edge. Get this wrong and the first cart row sits 24px lower than the panel beside it.

---

## 4. Radii, elevation, borders

```css
--radius-sm:.375rem; --radius-md:.75rem; --radius-lg:1.25rem;
--radius-xl:2rem;    --radius-full:9999px;
```

Soft, generous radii. This is a baby-care brand — no sharp corners.

### 4.1 Radius map

| Element | Reference kit | NeoCare token | Utility |
|---|---|---|---|
| Buttons, size chips, pack chips | `rounded-full` | `--radius-full` | `rounded-pill` |
| Product tile, PDP gallery image | `rounded-xl` (12px) | `--radius-md` | `rounded-soft` |
| Order-summary panel | `rounded-lg` (8px) | `--radius-md` | `rounded-soft` |
| Cart thumbnail, skeleton bars | `rounded-md` (6px) | `--radius-sm` | `rounded-tight` |

**This revises the product-tile radius.** Build spec v2.1 settled the tile at `rounded-tight` (6px) to match the previous reference site's crisper corners. The new reference uses `rounded-xl` — 12px, which is `rounded-soft` exactly. Move the product tile to `rounded-soft` in all three places it appears: `ProductCard`, the PDP gallery image, and the `/category/{slug}` placeholder cards. Everything already on `rounded-card` (header dropdowns, New Born marquee, `SizeSelector`, `ProductSequence`) is untouched.

Pills on every interactive element. Nothing is square.

### 4.2 Elevation — almost none

```css
--shadow-sm: 0 1px 2px rgb(20 26 22 / .06);
--shadow-md: 0 4px 16px rgb(20 26 22 / .08);
--shadow-lg: 0 12px 40px rgb(20 26 22 / .10);
```

Commerce surfaces use **one** shadow: `shadow-card` (`--shadow-sm`) on the checkout button and on the sticky header once scrolled. The order-summary panel separates from the page by **fill and radius, not shadow** — it is `bg-surface-brand` with `rounded-soft` and no elevation at all. Resist adding one; the flatness is what makes the panel read as part of the page rather than floating over it.

`shadow-raised` and `shadow-float` stay in use on the marketing surfaces (hover cards, header dropdowns, cart drawer) exactly as v1.0 specified.

### 4.3 Borders

One hairline weight everywhere: `border border-hairline` (1px, `--color-border`). Used on gallery images, product tiles, size chips, cart thumbnails, section dividers, and order-summary row separators.

---

## 5. Motion

```css
--ease-out   : cubic-bezier(0.16, 1, 0.3, 1);
--ease-inout : cubic-bezier(0.65, 0, 0.35, 1);

--dur-fast  : 150ms;
--dur-base  : 300ms;
--dur-slow  : 600ms;
```

**Motion on a commerce surface exists only to absorb latency.** No scroll reveals, no parallax, no page transitions. If an animation is not covering a state change the visitor caused, delete it.

The reference kit expresses this through the `motion` library. NeoCare does not carry that dependency and is not adding it (build spec §2). Each effect below has a CSS equivalent built from the tokens above:

| Where | Behaviour | Implementation |
|---|---|---|
| Button spinner | 16px ring, `border-r-transparent`, rotates 1s linear infinite | `@keyframes` + `animate-[spin_1s_linear_infinite]`; the button keeps `flex items-center justify-center gap-2` so the label does not jump when the spinner mounts |
| Button label on load | shifts to make room for the spinner | the `gap-2` flex row does this without a transform |
| Cart row enter/exit | fade + 20px slide | `@keyframes` pair at `--dur-base` / `--ease-out` |
| Quantity change | no animation | the number swaps; `aria-live="polite"` announces it |
| Chip / button hover | fill darkens one step | `transition-colors duration-[--dur-fast]`. **Never a transform on hover** — the reference kit has none, and NeoCare's existing `md:hover:scale-[1.03]` on `Button` is removed on commerce surfaces |

**Scroll-scrub is separate from these.** Scrubbed animation is driven by scroll position, not duration — GSAP `scrub: 1`, never a fixed duration. Unchanged, and confined to the Look Closer sequence.

**Every motion token is void under reduced motion** — already enforced globally in `globals.css`, and GSAP timelines check `matchMedia('(prefers-reduced-motion: reduce)')` and render their end state immediately.

---

## 6. Components

### 6.1 Button

| Variant | Fill | Text | Border |
|---|---|---|---|
| Primary | `--nc-green-800` | white | none |
| Secondary | transparent | `--nc-green-800` | 1.5px `--nc-green-800` |
| Accent | `--nc-orange-600` | white | none |

- Min touch target **44 × 44px**. Non-negotiable on mobile.
- Radius `--radius-full`. Focus: 2px `--color-focus` ring, 2px offset.
- Hover: darken one step. Active: `scale(.98)`.

**Primary CTA on a commerce surface** takes the reference kit's shape: `w-full`, `px-8 py-3`, `type-body font-semibold`, `flex items-center justify-center gap-2` so a spinner sits inline with the label rather than displacing it. Disabled-while-busy renders at the hover fill (`bg-brand-hover`), not at reduced opacity — a busy button should read as pressed, not as unavailable.

**Inline text button** (cart "Remove"): no fill, no border, `font-semibold text-brand hover:text-brand-hover`, `disabled:opacity-70`, and the same `gap-2` spinner slot.

### 6.2 Card

`--nc-paper` on `--nc-cream`, `--radius-lg`, `--shadow-sm` → `--shadow-md` on hover. Padding `--space-6`. Marketing surfaces only — the product card below is a different object.

### 6.3 Product card

- Image tile: `aspect-square`, `rounded-soft`, `border border-hairline`, `bg-surface-alt`, image `object-contain` with `p-8` padding. Diaper photography is a cutout on white, so `object-contain` on the cream tile is correct — `object-cover` would crop the product.
- Below the tile: name at `type-body font-semibold text-fg`, price at `type-body text-fg-muted`. A single price, or `min – max` when the product has multiple pack variants.
- Whole card is one link to the product page.
- Quick-add: a **circular icon button**, `h-9 w-9 rounded-pill`, positioned `absolute bottom-3 left-3` inside the tile. Always visible below `sm`; `opacity-0` until `group-hover` at `sm` and up. Accessible name from `aria-label` — no tooltip, no visible text.
- Quick-add appears **only** on single-variant products. Multi-pack products route through the product page so the visitor chooses a pack.

### 6.4 Size picker and pack picker

Both are the reference kit's chip row, and they stack: size first, pack second.

- Row: `grid grid-cols-3 gap-3 sm:grid-cols-5`.
- Chip: `rounded-pill border border-hairline bg-surface px-3 py-3 type-small font-semibold uppercase text-fg`, `sm:flex-1`.
- Hover: `hover:bg-surface-brand`. Selected: `border-transparent bg-brand text-fg-inverse`, hover `bg-brand-hover`.
- Unavailable: `opacity-50 cursor-not-allowed`.
- Focus: 2px `--color-focus`, 2px offset.
- **Never fix a chip width to English content.** `sm:flex-1` handles this; a hardcoded width does not. "New Born" is already three times the width of "XL", and Bangla runs 15–30% longer again.

### 6.5 Rating row — replaced, slot kept

The reference kit's rating row is: value · five stars · `·` separator · review count, all `text-sm`, sitting `mt-4` under the product title.

NeoCare has no rating data and will not fabricate one. **The row stays; its content becomes the product's real facts** — weight range, then a `·` separator at `--nc-ink-300`, then the available pack sizes. Same position, same `type-small`, same `mt-4`. No stars, no `--color-rating`.

### 6.6 Order summary panel

`bg-surface-brand`, `rounded-soft`, `px-6 py-6 sm:p-6 lg:p-8`, no shadow.

**The CTA sits above the line items, not below.** This is the reference kit's ordering and it is deliberate — the visitor who already knows what they want does not have to read past the arithmetic to act. Then: line items separated by `border-t border-hairline pt-4`, the total row separated the same way at `type-body font-semibold`, and a centred "or Continue shopping" text link at the bottom in `type-small`.

Muted text inside the panel resolves to `--nc-ink-700` automatically via the `.bg-surface-brand` rule in §1.6. Do not override it.

### 6.7 Feature callout (S4–S8) — unchanged

- Desktop: SVG arrow, 1.5px stroke, `--nc-green-700`, animated via `stroke-dashoffset`.
- Mobile: **no arrow.** Card with image, title, body.
- Arrow endpoints are `{x%, y%}` against the locked hero frame only.

### 6.8 FAQ accordion (S11) — unchanged

Native `<details>`/`<summary>`. Chevron rotates 180° over `--dur-base`. Summary is the full-width click target, min-height 44px.

---

## 7. Layout

```css
--bp-sm: 480px;  --bp-md: 768px;  --bp-lg: 1024px;  --bp-xl: 1280px;
```

**Mobile-first.** The <768px layout is the primary design, not a fallback. Design it first; treat ≥768px as enhancement.

### 7.1 Containers

| Surface | Container |
|---|---|
| Page main | `mx-auto max-w-2xl px-4 pb-16 sm:px-6 sm:pb-24 lg:max-w-7xl lg:px-8` |
| Header bar | `mx-auto max-w-(--container-content) px-4 md:px-6` |
| Marketing sections | `mx-auto max-w-(--container-content) px-4 md:px-6` (unchanged) |

The commerce main container is **narrower than the marketing container below `lg`** — `max-w-2xl` (672px) up to 1024px, then `max-w-7xl` (1280px). That is the reference kit's shape and it is what keeps a product page from sprawling on a tablet. Marketing sections keep `--container-content` (1200px) at every width, so the two rhythms differ by design; do not unify them.

### 7.2 Product page — 12 columns, gallery overlaps rows

```
lg:grid lg:auto-rows-min lg:grid-cols-12 lg:gap-x-8

┌──────────────────────────────┬───────────────────┐
│ gallery                      │ header (5/8)      │  row 1
│ col-span-7 col-start-1       ├───────────────────┤
│ row-span-3 row-start-1       │ pickers + CTA     │  row 2
│                              │ + details (5)     │  row 3
└──────────────────────────────┴───────────────────┘
```

- Header block: `lg:col-span-5 lg:col-start-8`.
- Gallery: `mt-8 lg:col-span-7 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:mt-0`.
- Controls column: `mt-8 lg:col-span-5`.

Gallery inner grid: `grid-cols-1 lg:grid-cols-2 lg:grid-rows-3 lg:gap-8`. The first image spans `lg:col-span-2 lg:row-span-2`; the rest are `hidden lg:block`. **Mobile shows one image only** — that is the design, not a limitation.

Where a product has only one real photograph, the inner grid drops to a single square tile and the `lg:grid-rows-3` track collapses; the right-hand column then sets the row heights. This is the correct degradation — see build spec §6.3 for which images are real and may be shown.

### 7.3 Cart page

```
lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16
cart list → lg:col-span-7   |   summary panel → lg:col-span-5
```

`lg:items-start` matters: without it the summary panel stretches to the height of the item list.

### 7.4 Product grid

`grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3`.

Heading row above it: title and intro grouped in one `<div>`, laid out with `flex items-end justify-between`. No "View all" link — the grid already renders the entire five-product catalogue, so the link would point at an identical list.

### 7.5 Grid system

4 columns <768px, 8 columns 768–1024px, 12 columns ≥1024px. Gutter `--space-4` mobile, `--space-6` desktop.

---

## 8. Interaction states

- **Focus:** `focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2` on every interactive element. `globals.css` already provides a `:focus-visible` outline as the floor; the ring is the commerce-surface treatment on top of it.
- **Selected chip:** `border-transparent bg-brand text-fg-inverse`.
- **Disabled:** `opacity-50 cursor-not-allowed` for out-of-stock or unavailable; `disabled:bg-brand-hover` for a busy primary button; `disabled:opacity-70` for a busy inline text button.
- **Hover:** one step darker on fills, one step darker on text. Never a transform.
- Every clickable element carries an explicit `cursor-pointer`.

---

## 9. Loading and skeletons

Stream with `<Suspense>`. **Every fallback is a hand-built skeleton that matches the real node's box** — the same borders, the same radii, the same widths, with fixed bars (`h-5 w-24`, `h-4 w-32`) filled `bg-ink-100` and pulsing with `animate-pulse`.

There are **no spinners for page-level loads.** A spinner appears only inside a control the visitor just activated: add-to-cart, remove-from-cart. Everything else uses a skeleton.

A skeleton whose box does not match the loaded node causes a layout shift, which costs CLS against the §10 performance budget. Measure the loaded node and copy its dimensions; do not approximate.

---

## 10. Bilingual

- `<html lang="bn">` or `lang="en"` — drives the line-height fork in §2.3.
- Both scripts are LTR. No RTL work needed.
- Language toggle is always visible in the header. Never auto-switch on IP.
- Numerals: Western digits in both locales (`src/lib/numerals.ts`). Resolved.
- **Bangla strings run 15–30% longer than English.** Never fix a button, chip, nav item, cart row or search input width to English content. Every width on a commerce surface is either intrinsic or `flex-1`.
- All-caps and letter-spacing are neutralised on `/bn` by the `globals.css` rule (§2.3), so the reference kit's `uppercase` chips may be written verbatim.

---

## Addendum — v3.1 (23 August 2026)

### Section rhythm is viewport-dependent

`--section-rhythm` remains `clamp(4rem, 10vh, 8rem)` at 768px and above.
**Below 768px it is a flat `2.75rem` (44px).**

The clamp is keyed to viewport height, so on a 812px phone it resolved to 81px
— applied as `padding-block`, 162px between every adjacent pair of sections, or
20% of the viewport spent on nothing. Measured across the homepage at 375px it
totalled 835px.

The generous rhythm this document asks for is a property of a large viewport,
where a section boundary needs real air to read as one thing ending and another
beginning. On a phone that boundary is already unambiguous — a section fills
the screen — and the same air reads as a gap the reader scrolls through.
BUILD_SPEC §1 non-negotiable 1 says mobile is the primary design rather than
desktop scaled down; this is that rule applied to spacing.

Defined in `tokens.css` under `@media (max-width: 767px)`. Figures and the rest
of the budget work are in BUILD_SPEC §11.2.

### The horizontal card row

A repeating pattern as of v3.1, used in exactly two places: the homepage
category rows (BUILD_SPEC §5.5) and Look Closer's feature callouts (§5.6). Both
collapse a vertical stack of same-shaped cards into one swipeable row on small
viewports and restore the original layout above the breakpoint.

- Card width `46%` for product cards, `82%` for the wider feature cards. Both
  leave the next card visibly clipped at the viewport edge — that clipping IS
  the swipe affordance, so the row bleeds full-width via `-mx-4 … px-4` while
  the first card stays on the page gutter.
- `snap-x` with `snap-start` on each item, **and `scroll-px-4` to match the
  gutter**. Without it the browser seats card one against the scrollport edge,
  which ignores padding: the row silently scrolls itself 16px on load and every
  card sits 16px left of its own heading. Measured, not theoretical.
- A scrollable region is a keyboard target: `tabIndex={0}` plus an accessible
  name (WCAG 2.1 — a scrolling `div` is not focusable by default). **A row with
  nothing to scroll takes neither**, or it becomes a dead stop in the tab order.
- Never applies to a full listing, only to a teaser row. Category pages and
  `/products` stay grids: there the section is the page.

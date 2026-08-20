# NeoCare Demo Storefront — Build Spec
**v3.0** · 19 August 2026 · For Claude Code · Companion to `DESIGN.md` v2.0
Supersedes v2.1 (kept at `BUILD_SPEC.md.v2.bak`).

> **This is an imperative build spec, not a discussion document.** Where it says a value, use that value. Where it says **Stop and ask**, stop and ask.
> Rationale for the v1.0/v2.x product decisions lives in `NeoCare_Rebuild_Plan.md` — read that only if a decision here seems wrong.

---

## 0. What changed in v3.0, and why

v2.1 modelled the storefront on `yournextstore`. v3.0 **re-bases the storefront layout on the `shirt-shop` reference kit** (`vercel/flags → examples/shirt-shop`, MIT) — supplied as `DESIGN-SYSTEM.md`, `tokens.css` and `ui-kit.tsx`.

Three surfaces are re-laid-out to match that kit exactly:

1. **The upper half** — a promo bar above a restructured header, and the commerce page container (§5).
2. **Products** — the grid, the card, and the product detail page's 12-column gallery-overlap layout (§6).
3. **Cart** — the row anatomy, and a 7/5 cart page with an order-summary panel (§7).

**What is ported: layout, grid geometry, type hierarchy, spacing rhythm, radii, interaction states, motion behaviour, and component anatomy.**
**What is not ported: the kit's colour values, its typography, and its four npm dependencies.** Colour comes from `DESIGN.md` §1.5's mapping table. Dependencies are replaced per §2.

**All existing NeoCare content is preserved.** No approved string is reworded, no section is deleted, no product is invented. Where the reference kit has a slot NeoCare has no content for, the slot is filled with real NeoCare data (§6.4, §6.5) or ships a `[TODO: client]` placeholder (§9). Nothing is fabricated to fill a layout.

**What is untouched by v3.0:** `DESIGN.md` §1 palette and §2 type tokens, `src/styles/tokens.css`, the fonts, the nav *items*, the bilingual system, `Hero`, `TrustStrip`, `NewbornSection` and its marquee, `SizeSelector`'s recommendation logic, `Faq`, `ProductSequence` ("Look Closer"), `Footer`, and the entire §4 product data model. Everything in v2.1 §4, §7, §8, §13 and §14 carries forward unchanged and is restated here only where v3.0 adds to it.

---

## 1. Non-negotiables

Carried forward from v2.1, unchanged. Every one of these outranks layout parity with the reference kit.

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

`gsap` and `lenis` stay. No new dependency of any kind ships in v3.0.

---

## 3. Design tokens

`DESIGN.md` §1–§5 remain the single source for colour, type, spacing, radii and motion. **`src/styles/tokens.css` needs no edit for v3.0** — every value the storefront needs already exists.

**`DESIGN.md` §1.5 is the colour port.** It maps each of the reference kit's twelve semantic tokens to exactly one NeoCare token. When reference markup says `bg-surface-raised`, write the utility in that table's right-hand column. **No hex literal outside `tokens.css`.** No new token.

Two mappings in that table exist because the reference kit is wrong for NeoCare, not because of translation — read them before writing a colour: skeleton bars use `bg-ink-100` (not the panel surface), and icons at rest use `text-ink-500` (not `text-ink-300`, which fails WCAG 1.4.11 at 2.2:1).

`globals.css` needs one addition: the `@keyframes` for the spinner and the cart-row enter/exit, per `DESIGN.md` §5.

---

## 4. Product data — unchanged

`src/lib/sizes.ts` is the catalogue: the five diaper sizes are the five products. `SizeRow` already carries `slug` and `priceByPack`. No schema change in v3.0.

- **§4.1 Prices stay placeholders.** Integer poisha, round numbers, `// TODO: client — placeholder price, not confirmed` at the data source. The UI does not visually distinguish a placeholder price from a real one; the marker lives in code. No price ships to production unreplaced.
- **§4.2 The three placeholder categories** (Adult Diapers, Baby Wipes, Face Wipes) keep their v2.1 treatment: 3–4 cards each from real NeoCare diaper photography, an honest "Coming soon" label on the category page, add-to-cart disabled by default, `// TODO: client — placeholder photography` at the data source. They adopt v3.0's card and grid layout (§6.1, §6.2) and nothing else.
- **Parenting Journey** stages stay `#` placeholders. No products, no prices, no images.

---

## 5. The upper half

### 5.1 Promo bar — NEW

A full-width band above the header.

- Markup: one `<div>`, `bg-green-900 px-4 py-2 text-center type-small font-semibold text-fg-inverse`.
- **Not sticky.** It scrolls away; the header sticks beneath it. Do not wrap both in a sticky container.
- Content: `t.promo.text` — a new key, shipped as a `[TODO: client]` placeholder per §9. The reference kit's copy is a free-delivery threshold; NeoCare has no such offer and non-negotiable 7 forbids inventing one. **Do not write a delivery threshold, discount, or shipping promise into this bar.**
- When `t.promo.text` is an empty string, render nothing at all — no empty band.

`--nc-green-900` on `--color-text-inverse` measures 13.6:1.

### 5.2 Header — restructured

Keep everything `Header.tsx` already does: sticky, transparent over the hero then `bg-surface shadow-card` after 80px, the `<noscript>` solid-state fallback, the native `<details>` mobile disclosure, `SearchInput`, `CartButton`, `LanguageToggle`. Change only the bar's geometry and the cart affordance:

1. **Height 96px (`h-24`) at every width**, replacing `h-16 md:h-20`. This is the reference kit's single header height and it is what gives the upper half its air. The hero's negative top margin must change with it: `-mt-24` in place of `-mt-16 md:-mt-20`, one value now instead of two.
2. **Three-zone row:** `flex h-24 items-center justify-between`. Left zone `flex flex-1 items-center` holds the logo (mobile) or logo + nav (desktop, `hidden h-full space-x-8 lg:flex`). Right zone `flex flex-1 items-center justify-end` holds search, cart, language toggle, and the mobile menu disclosure.
3. **Nav items — unchanged, do not add or remove:** Features · Our Products (Diapers Line, Adult Diapers, Baby Wipes, Face Wipes) · Parenting Journey (Conception, Pregnancy, New Born, Baby, Family) · New Born · Find your size · FAQ. Link targets unchanged: Diapers Line → `/products`, the other three → `/category/{slug}`, all of Parenting Journey → `#`.
4. **Nav link styling** becomes the reference kit's: `type-small font-semibold text-fg-muted hover:text-fg`, no pill background on hover. The current `text-brand hover:bg-surface-brand` treatment is replaced. Dropdown panels keep their existing `rounded-card` + `shadow-float` chrome.
5. **Cart affordance** becomes the reference kit's: icon plus a bare count, not a badge. `group -m-2 flex items-center p-2`; glyph `h-6 w-6 flex-shrink-0 text-ink-500 group-hover:text-fg-muted`; count `ml-2 min-w-3 type-small font-semibold text-fg-muted group-hover:text-fg`. Before hydration, render `ml-2 h-4 w-3 rounded-tight bg-ink-100` in the count's place — a skeleton the exact size of the digit, so the row does not shift when the count arrives. The count still needs `aria-live="polite"`.
6. **The cart icon still opens the drawer** (§7.1). It does not navigate.

### 5.3 Commerce page container

The product detail page and the cart page wrap their content in:

```
mx-auto max-w-2xl px-4 pb-16 sm:px-6 sm:pb-24 lg:max-w-7xl lg:px-8
```

**This container is for those two routes only.** The homepage keeps its current structure: full-bleed sections, each with its own `mx-auto max-w-(--container-content) px-4 md:px-6` inner container. Do not wrap the homepage in the commerce container, and do not widen the marketing sections to `max-w-7xl` — the two rhythms differ deliberately (`DESIGN.md` §7.1).

### 5.4 Homepage section order — unchanged

Promo bar · Header · Hero · Shop/Product Grid · Trust strip · New Born · Size selector · FAQ · Look Closer · Footer.

Scroll budget still **≤ 900vh**. Re-measure after the header height change.

---

## 6. Products

### 6.1 Product card

`src/components/product/ProductCard.tsx`. Keep its current props, quick-add gate, and `AddToCartButton` nesting. Change:

1. **Tile radius `rounded-tight` → `rounded-soft`** (12px, matching the kit's `rounded-xl`). Apply in all three places the product tile appears: `ProductCard`, the PDP gallery image (§6.3), and the `/category/{slug}` placeholder cards.
2. **Remove the hover scale on the image.** `group-hover:scale-105` goes; the reference kit has no hover transform anywhere and `DESIGN.md` §8 forbids one on commerce surfaces. The card's affordance is the quick-add reveal, which is enough.
3. Everything else stays: `aspect-square`, `border border-hairline`, `bg-surface-alt`, `object-contain p-8`, name at `type-body font-semibold text-fg`, price at `type-body text-fg-muted`, quick-add as a `h-9 w-9 rounded-pill` icon button at `absolute bottom-3 left-3`, always visible below `sm` and `opacity-0 sm:group-hover:opacity-100` above it.

`object-contain`, not `object-cover`: the diaper photography is a cutout, and cover would crop the product.

### 6.2 Product grid — unchanged

`src/components/sections/ProductGrid.tsx` already matches: heading and intro grouped in one `<div>` laid out `flex items-end justify-between`, then `grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3` over all five products. No pagination, no "View all" — the grid renders the entire catalogue, so the link would point at an identical list. Content keys `shop.title` / `shop.intro` / `shop.quickAdd` unchanged.

### 6.3 Product detail page — re-laid-out

`src/app/[lang]/product/[slug]/page.tsx`. Replace the current two-column `md:grid-cols-2` layout with the reference kit's 12-column gallery-overlap grid.

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

### 6.6 Size selector section — unchanged

`SizeSelector`'s range input, `recommendFor` logic, `aria-valuetext`, numeric readout and alternate-size chips all stay. Its recommended-size card keeps its `AddToCartButton` and its "View details" link to the PDP. Its chips move to the §6.4 styling so the two chip rows on the site match; nothing else changes.

---

## 7. Cart

### 7.1 Cart drawer — kept, internals restyled

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

### 7.3 Cart state — unchanged

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

Everything in v2.1 §9 still applies. v3.0's layout changes add:

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

## 11. Performance gates — unchanged budgets

| Metric | Budget |
|---|---|
| LCP, Slow 4G / mid-tier Android | ≤ 2.5s |
| JS, gzipped | ≤ 180 KB |
| Hero image | ≤ 180 KB |
| Turntable total | ≤ 1.5 MB, desktop only, lazy |
| Bangla font, one weight | ≤ 100 KB |
| Total, first view | ≤ 1.2 MB |

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
- [ ] Gallery images past the first come only from `public/product/features/` (§6.3)
- [ ] Checkout page never implies a completed transaction
- [ ] No hover transform on any commerce surface (§6.1, `DESIGN.md` §8)
- [ ] Every chip and button width is intrinsic or `flex-1` — none fixed to English text
- [ ] `uppercase` neutralised on `/bn`, verified in the browser
- [ ] Cart math correct and covered by tests
- [ ] Total homepage scroll ≤ 900vh after the header height change
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
- Real Adult Diapers / Baby Wipes / Face Wipes photography, inventory or purchasable products (§4.2).
- Products or pages for Parenting Journey (§4).
- Footer changes. `Footer.tsx` is untouched by v3.0; the reference kit's footer grid is not ported.

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
11. **Real photography, names and prices** for Adult Diapers, Baby Wipes and Face Wipes (§4.2).
12. **Whether to enable add-to-cart** on the three placeholder categories — disabled by default.

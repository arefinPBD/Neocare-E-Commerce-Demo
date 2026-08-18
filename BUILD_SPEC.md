# NeoCare Demo Landing — Build Spec
**v2.1** · For Claude Code · Companion to `DESIGN.md`

> **This is an imperative build spec, not a discussion document.** Where it says a value, use that value. Where it says TODO, stop and ask.
> Rationale lives in `NeoCare_Rebuild_Plan.md` — read that only if a decision here seems wrong.

---

## 0. v2.0 — what changed from v1.0, and why

v1.0 was a scroll-driven **marketing page with no commerce**: one route, a pinned product-reveal sequence near the top, a single "Shop Now" button that went nowhere. Stages 1–4 of that spec are built and signed off — see the "Stages" log in `CLAUDE.md`.

This revision re-shapes the site around an actual **storefront**, modeled on the UX of [`yournextstore/yournextstore`](https://github.com/yournextstore/yournextstore) (demo: `demo.yournextstore.com`) — its product grid, product card, product detail page, and slide-out cart. Concretely:

- **What's copied from the reference site:** the product-showcase pattern (grid → PDP) and the cart pattern (icon → slide-out drawer → items/subtotal → checkout button). These are *interaction and layout* patterns, not code — the reference repo runs on Stripe/`commerce-kit`, which we do not adopt (§13).
- **What stays exactly as already built:** `DESIGN.md` tokens (colour palette, type scale, spacing, motion durations), the fonts, the header's nav *items* (Features · Our Products · Parenting Journey · New Born · Find your size · FAQ), the bilingual system, `NewbornSection`'s marquee gallery, the size-recommendation logic in `sizes.ts`, and the pinned "Look Closer" product-reveal sequence (relocated, not rebuilt — §5.7).
- **What's new:** a real (client-side, no backend) shopping cart; a product grid and product detail pages built from the five diaper sizes as real "products"; a header search bar.
- **Homepage section order changes.** "Shop Now" (formerly the last section, S12) is superseded by the new Product Grid, which now sits near the top, immediately after the hero — mirroring the reference site's `Hero → Featured Products` opener. "Look Closer" (formerly S3–S8, pinned right after the hero) moves to the bottom of the page, just above the footer.
- **Non-negotiable 2 of v1.0 ("Out of scope: cart... checkout, payments") is superseded** by §13 below. Re-read §13 before assuming anything about payments is now in scope — it isn't.

### 0.1 v2.1 — closing the layout gap with the reference site (2026-08-18)

v2.0 adopted the reference site's *patterns* (grid → PDP, cart drawer) but the actual homepage still reads as visually different from `yournextstore`'s. Client feedback: **the upper half of the page — Header, Hero, Product Grid — should match the reference site's layout exactly, in NeoCare's own colour theme.** Decisions confirmed with the client on 2026-08-18, before touching anything:

- **Hero restructures to the reference's text-hero layout, with the photo demoted to a background layer.** The reference's hero (`components/sections/hero.tsx`) is: contained width, a left-aligned text column (headline, subhead, two pill CTAs), and a decorative gradient — no photo. NeoCare keeps its hero *photo* (it's real product photography, not decoration to throw away) but stops using it as the full-bleed foreground with a dark contrast scrim. Instead: the photo becomes a **background layer at reduced opacity**, behind the same text-column structure the reference uses, so the layout genuinely matches (contained text block, not an image-first full-bleed section) while the photo still carries brand warmth instead of being deleted outright. This **replaces** v1.0/v2.0's full-bleed-photo-plus-scrim treatment and its Stage 4 contrast tuning — that tuning doesn't carry over as-is, because the text is no longer sitting on top of a full-strength photo (§5.1a has the details and the new contrast requirement).
- **"Upper half" = Header + Hero + Product Grid**, matching the reference's own opener (`Navbar → Hero → Featured Products`). Sections below (Trust strip onward) are unaffected by this pass.

Re-diffing against the actual reference source (`app/layout.tsx`, `components/sections/hero.tsx`, `components/sections/product-grid.tsx`, `components/product-card.tsx`, `components/quick-add-button.tsx`) is what produced the concrete deltas below — not a full rewrite, but not a no-op either. See §5.1, §5.1a and §5.2 for the updated component-level spec; each change states the reference behaviour it's copying.

Do not re-derive these decisions from first principles while building; they were confirmed with the client on 2026-08-18. Where this file is silent on a UI detail the reference repo covers, look at the reference repo, then ask — do not invent.

---

## 1. What you are building

A **demo storefront** for NeoCare baby diapers: real product browsing and a real (non-paying) cart, on top of the marketing sections already built. One bilingual site, still no backend/database — product and price data live in the codebase, cart state lives in the browser.

**In scope:** everything in v1.0's scope, plus a product grid, product detail pages, a functional client-side cart (add/remove/adjust qty, slide-out drawer, subtotal), and header search over the product catalogue.
**Still out of scope:** payments, real checkout, order management, user accounts, Medusa, a CMS, courier/SMS/email integrations, 301s. See §13.

### Non-negotiables

1. **Mobile-first.** The <768px layout is the *primary* design. Build and verify it before writing a single desktop scroll effect. The real audience is mid-tier Android on mobile data in Bangladesh.
2. **Every scroll effect has a defined "off" state** that still communicates the product.
3. **No AI-generated image may carry a product claim.** Feature imagery uses real product photography only.
4. **Navel cutout appears in the New Born section only.** Never elsewhere. It is a New Born SKU feature; showing it elsewhere is a false claim.
5. **No invented price.** Every price shown is a clearly-marked placeholder (§4.1) until the client supplies real figures — the existing "never invent a figure" rule (§12) now explicitly covers prices too.
6. **The cart never implies a real transaction.** No "Order confirmed," no reference number, nothing that reads as a completed purchase anywhere in the cart → checkout flow (§6.4).

---

## 2. Setup

Already scaffolded (Next.js 16.3+, TypeScript, Tailwind, `src/` dir, `next/root-params` for `[lang]`). No new framework dependencies are required for the cart (plain React Context + `localStorage`); add only what's actually needed for the search UI (e.g. a small fuzzy-match helper) — do not pull in `commerce-kit`, Stripe, or any backend SDK.

Updated file map (additions marked `NEW`, moved items marked `MOVED`):

```
src/
  app/
    [lang]/
      layout.tsx
      page.tsx                    # section order: §5.0
      products/page.tsx           # NEW — full product grid (Diapers Line)
      product/[slug]/page.tsx     # NEW — PDP
      category/[slug]/page.tsx    # NEW — placeholder grids, §4.2 (Adult Diapers/Baby Wipes/Face Wipes)
      checkout/page.tsx           # NEW — static placeholder, §6.4
    globals.css
  components/
    nav/
      Header.tsx  LanguageToggle.tsx
      SearchInput.tsx              # NEW
      CartButton.tsx               # NEW
    cart/
      CartProvider.tsx             # NEW — Context + localStorage
      CartSidebar.tsx              # NEW — slide-out drawer
      CartItemRow.tsx              # NEW
    product/
      ProductCard.tsx              # NEW
      ProductGallery.tsx           # NEW — PDP image gallery
      AddToCartButton.tsx          # NEW
      TurntableSequence.tsx FeatureArrow.tsx   # unchanged
    sections/
      Hero.tsx TrustStrip.tsx
      ProductGrid.tsx              # NEW — homepage "Shop" section, §5.2
      ProductSequence.tsx          # "Look Closer" — MOVED to bottom, §5.7
      NewbornSection.tsx
      SizeSelector.tsx Faq.tsx Footer.tsx
      # ShopCta.tsx removed — superseded by ProductGrid, §5.2
    ui/Button.tsx Card.tsx Accordion.tsx
  lib/
    motion.ts  useCanAnimate.ts
    sizes.ts                       # extended into product data, §4
    cart.ts                        # NEW — cart math, mirrors reference's cart-math.ts
  content/
    en.json  bn.json
  styles/tokens.css                # DESIGN.md §1-5 verbatim — untouched
public/
  product/  hero/  newborn/  brand/         # unchanged, reused for product images
```

---

## 3. Design tokens

**Unchanged.** `DESIGN.md` §1–5 remain the single source for colour, type, spacing and motion tokens. The redesign adopts the reference site's *layout and interaction* patterns, never its visual language — no neutral/grayscale reference palette, no reference typography. Every new component (product card, cart drawer, search input) is built from `tokens.css` exactly like every existing component. **Do not hardcode a hex anywhere in a component.**

---

## 4. Product data model

The five diaper sizes in `sizes.ts` become the real product catalogue — no new products are invented. Extend `SizeRow` (do not replace it; `SizeSelector`'s existing logic depends on it) with commerce fields:

```ts
export interface SizeRow {
  key: SizeKey;
  min: number;
  max: number;
  packs: number[];         // existing — one entry per pack-size variant
  image: string;
  imageW: number;
  imageH: number;
  // NEW:
  slug: string;             // '/product/{slug}' — e.g. 'medium'
  priceByPack: Record<number, number>;  // pack size → price in poisha (integer, avoid float money), §4.1
}
```

Each pack size (e.g. Medium's `[30, 50]`) is a **variant** of the same product, exactly like the reference site's `ProductCard` price-range display (`minPrice - maxPrice` when variants differ). A product with one pack size shows a single price; Medium shows a range.

### 4.1 Prices — placeholder, not invented

No price exists anywhere in this codebase today. Per client direction (2026-08-18): ship **round placeholder prices**, clearly marked, so cart math and the UI are demonstrable — never a client-approved figure.

- Store as `[TODO: client]`-style placeholders, e.g. `priceByPack: { 30: 45000, 50: 70000 }` (poisha; ৳450 / ৳700) with a `// TODO: client — placeholder price, not confirmed` comment at the data source.
- Render with the existing numerals decision (`src/lib/numerals.ts`, Western digits both locales).
- The size-selector and product-grid UI must not visually distinguish placeholder prices from real ones (no "demo price" badge in the UI itself) — the marker lives in code/comments, per the same pattern already used for `[TODO: client]` copy elsewhere on the site. This keeps the demo presentable while keeping the paper trail honest.
- Acceptance criteria §12 gets a new line for this: no price ships to production without being replaced by a client-confirmed figure.

"Parenting Journey" (Conception, Pregnancy, New Born, Baby, Family) are informational stages, not products — they have no real products and their links stay `#` placeholders. Do not invent products, prices, or images for them.

### 4.2 "Our Products" categories — placeholder catalogue, not invented photography

"Our Products" (Diapers Line, Adult Diapers, Baby Wipes, Face Wipes) *are* product categories, and NeoCare's roadmap is to sell all four — but only the Diapers Line has real inventory today (§4). Per client direction (2026-08-18): give each of the other three a **placeholder product grid** now, reusing existing NeoCare diaper photography (`public/product/**` — the same cutout/pack/feature-crop images already used elsewhere on the site), so the storefront reads as complete rather than as three dead nav links. This is the same "ship a marked placeholder, don't invent real content" move as §4.1's placeholder prices — the images are *real NeoCare photography*, not AI-generated or stock (non-negotiable 3 still holds), they're simply the wrong product's photography standing in until real Adult Diaper / Baby Wipes / Face Wipes photography exists.

- Each of the three placeholder categories gets 3–4 cards, built from existing images (vary which crop/angle each card uses so the grid doesn't look like a single repeated tile), with a size/variant name that's honestly a placeholder (e.g. "Adult Diapers — Regular", not a fabricated real-sounding SKU) and a placeholder price per §4.1's rules.
- **Every placeholder card, and the category page itself, carries an explicit `// TODO: client — placeholder photography, replace with real Adult Diapers / Baby Wipes / Face Wipes product shots` marker at the data source** — same code-level paper trail as `[TODO: client]` copy and placeholder prices. Unlike prices (which look identical to real ones in the UI per §4.1), do not present a Regular NeoCare diaper photo as if it were literally an Adult Diaper — a small, honest "Coming soon" or "Preview" label on these three category pages (not on the real Diapers Line) keeps this from reading as a false product claim to a real visitor while the layout/UX is still fully demonstrated.
- These three categories are still **not real, purchasable products**: their `AddToCartButton`s may exist for UX demonstration, but do not wire them into the same cart flow real Diapers Line products use without re-confirming with the client — the risk is a visitor "buying" an Adult Diaper that doesn't exist. Default to disabling add-to-cart on these three categories (button present, disabled, "Coming soon") unless told otherwise.
- Diapers Line itself (the real product) does **not** get this treatment — it already has real data per §4.

---

## 5. Sections — homepage order

### 5.0 Order (top to bottom)

1. **Header** (§5.1)
2. **Hero** (unchanged, §5.1a)
3. **Shop / Product Grid** (NEW, §5.2)
4. **Trust strip** (unchanged, §5.3)
5. **New Born** (unchanged, §5.4)
6. **Size selector** (unchanged behaviour, new "Add to cart" action, §5.5)
7. **FAQ** (unchanged, §5.6)
8. **Look Closer** (MOVED from directly after the hero, §5.7)
9. **Footer** (unchanged, §5.8)

Total landing scroll budget: still **≤ 900vh**. Moving Look Closer doesn't change its own scroll cost (§5.7's `end: '+=550%'` is untouched) — re-verify the total after the Product Grid and its now-larger footprint are added.

### 5.1 Header

Sticky. Transparent over hero → `--nc-paper` + `--shadow-sm` after 80px scrolled. Height 64px mobile / 80px desktop.

Layout, left to right (desktop): logo · nav (centre) · **search** · **cart icon with item-count badge** · language toggle. Mobile: hamburger (opens a full nav drawer, search input at its top per the reference site's mobile pattern) · logo · cart icon.

**Nav items — unchanged, do not add or remove:** Features · Our Products (dropdown: Diapers Line, Adult Diapers, Baby Wipes, Face Wipes) · Parenting Journey (dropdown: Conception, Pregnancy, New Born, Baby, Family) · New Born · Find your size · FAQ. Still no cart-icon-leads-nowhere problem — the cart icon now genuinely opens the drawer (§6).

**Link targets, updated:** Diapers Line → `/products` (§5.2b's real catalogue). Adult Diapers / Baby Wipes / Face Wipes → `/category/{slug}` placeholder grids (§4.2). All of Parenting Journey stays `#` — no page exists yet.

**Search:** a client-side filter over the five-product catalogue (§4) — no backend/API call, the dataset is tiny. Desktop: an input in the header that expands or opens a small results popover (product name, thumbnail, price) on typing, matching the reference site's inline pattern. Mobile: an input at the top of the nav drawer. Selecting a result navigates to that product's PDP (§5.2b). Empty/no-match state: plain "No products found" text, no dead-end.

**v2.1 — confirmed unchanged.** Re-diffed against the reference's actual header markup (`app/layout.tsx`): its structure (contained-width bar, logo+nav left/centre, search+cart right, sticky+blur) is already what §5.1 describes. The reference header is *always* solid/blurred; NeoCare's is transparent-over-hero then solid after 80px scrolled. Re-evaluate this once §5.1a's new hero (dimmed-photo background, not full-strength) ships — a transparent header over a lighter, more washed-out hero may read differently than it did over the old high-contrast photo. Not changed in this pass; flag if it looks wrong once built.

### 5.1a Hero — restructured, v2.1

**v1.0/v2.0 treatment (superseded):** full-bleed photo as the section's entire background, a dark gradient scrim over it for text contrast, headline+subhead+CTA bottom-anchored across the full width.

**v2.1 treatment**, matching the reference's `hero.tsx` structure with NeoCare's own photo and colour theme:

- **Layout:** contained width (same `--container-content` token as every other section, not full-bleed), generous vertical padding, a left-aligned text column capped at a readable measure (`measure` token) — headline, subhead, then the CTA. This is the reference's `max-w-2xl` text-column shape, not a hardcoded pixel value.
- **Background:** the hero photo (`hero-mobile.webp` / `hero-desktop.webp`, same art-directed pair as before — no new asset needed) fills the section as a **background layer at reduced opacity**, sitting behind the text column, not in front of it. This replaces the scrim-over-full-strength-photo treatment: instead of darkening a bright photo enough to read text on top, the photo itself is dimmed so it reads as texture/atmosphere rather than a competing foreground image. Use NeoCare's own surface tokens (`--color-bg` / `--nc-cream` family) as the base the dimmed photo sits over, so the section still resolves to NeoCare's palette, not a grey wash. **Opacity: 45%** (`opacity-45`) — raised from the initial 15% per client direction (2026-08-18, "+30 percent") for more visible photo presence; this is a meaningfully stronger image than the first pass, so §5.1a's contrast re-verification below matters more here, not less.
- **Decorative element:** the reference fills the empty right-hand space (where there's no photo) with a subtle gradient. Here that space already has the dimmed photo — no separate gradient needed; don't add one on top of the photo, it'll look muddy.
- **CTA:** keep the existing single button (`t.hero.cta`, "Find your size" → `#sizes`). The reference shows two buttons (primary + secondary "Our Story") because it has two real destinations; NeoCare has one meaningful CTA at this point in the page (a second "About us"-style link isn't in scope here) — don't add a second button just to match the count.
- **Contrast — re-verify, don't assume it's fine.** At 45% opacity the photo is a real presence, not a faint texture — the "dominated by the solid base colour" reasoning from the 15% version is weaker now. Sample actual rendered pixels once built, same method as the Stage 4 check (`CLAUDE.md`), and confirm ≥4.5:1 for the headline and subhead against the dimmed photo + base surface colour, at 45% opacity specifically. Do not reuse the old full-bleed scrim gradient values; they were tuned for a different treatment and don't transfer. If 45% fails the ratio in the photo's busier regions (the headline sits over whatever part of the image is behind it), the fix is a text-side treatment (drop-shadow, or a light scrim behind just the text column) rather than lowering the opacity back down, since the opacity value is now a client-specified target, not a free variable.
- Desktop `object-position: bottom` fix from the 2026-08-18 session carries over unchanged — it's about which part of the photo shows, still relevant now the photo is a background layer instead of a foreground one.

### 5.2 Shop / Product Grid — NEW

Directly below the hero, mirroring the reference site's `Hero → Featured Products` opener.

- Section heading + one-line intro (new copy keys, plain and factual — no performance claims, per non-negotiable 3/§12).
- A responsive grid of **product cards**, one per diaper size (5 total): 1 column mobile, 2 columns ≥640px, 3 columns ≥1024px — same breakpoints as the reference `ProductGridSkeleton` (`lg:grid-cols-3`).
- **`ProductCard`** (`components/product/ProductCard.tsx`), modeled on the reference `product-card.tsx`:
  - Square (`aspect-square`) image, rounded corners, `object-cover`. Primary image from `SizeRow.image`; no secondary hover-swap image required (most sizes share one cutout image — a fabricated "alternate angle" would violate non-negotiable 3).
  - Below the image: product name (size label) and price — a single value, or a `min – max` range when the product has multiple pack variants (Medium).
  - The whole card links to `/product/{slug}` (§5.2b).
  - A quick-add affordance (button that adds the default/only variant straight to the cart without leaving the grid) **only** when the product has a single pack-size variant — sizes with multiple packs (Medium) require the visitor to choose a pack size, so quick-add is omitted there and the card links through to the PDP instead. This mirrors the reference site's `singleVariant` gate in `product-card.tsx` — do not build a size-picker inside the card itself.
- No pagination needed (only 5 products) — skip the reference site's `listing-pagination.tsx` entirely.

#### 5.2a v2.1 — layout parity fixes

Re-diffed against the reference's real source (`components/sections/product-grid.tsx`, `components/product-card.tsx`, `components/quick-add-button.tsx`, not just its skeleton/loading state, which is what v2.0 was built against). Four concrete deltas:

1. **Heading row.** The reference wraps the title+description together in one `<div>`, and lays that div out against a "View all" link with `flex items-end justify-between`. Match this structure — title and intro stay together on the left, in a flex row (not a fully centred stack).
2. **Card corner radius — less round.** The reference's image tile uses `rounded-2xl` (16px); v2.1's first pass used `--radius-card` (`rounded-card`, 20px), which read noticeably rounder side-by-side. A second pass at `--radius-soft` (12px) still read too soft against the reference's crisper corners on review — settled on `--radius-tight` (`rounded-tight`, 6px, the sharpest step in the existing scale) instead, on the product tile everywhere it appears: `ProductCard`, the PDP gallery image, and the `/category/{slug}` placeholder cards. Everything else that uses `rounded-card` (header dropdowns, the New Born marquee, `SizeSelector`'s card, `ProductSequence`'s cards) is untouched — this is scoped to the product-tile family only.
3. **Quick-add button — restyled to match exactly.** The reference's quick-add (`quick-add-button.tsx`) is a **small circular icon button** (`h-9 w-9 rounded-full`, a shopping-bag glyph, no visible text), positioned `absolute bottom-3 left-3` inside the image — not a labelled pill in the top-right corner. Visibility: opacity-100 on mobile (always visible — no hover on touch), `opacity-0` until `group-hover` on desktop. Carry over the icon-button shape, the bottom-left position, and the hover-reveal behaviour; the reference's tooltip (a Radix dependency this project doesn't have) is replaced by a plain `aria-label` — same accessible name, no new dependency.
4. **"View all" link — deliberately omitted, not copied.** The reference shows `limit=6` "featured" products with a "View all" link through to the full catalogue, because their catalogue is large. NeoCare's Product Grid already renders **all five** real products — there is no larger catalogue behind a "View all" link to reveal, so copying it verbatim would link to a page showing the identical five cards. Skip it. **Flagging this as a judgment call, not a silent deviation** — if the client wants the link anyway (e.g. for visual parity even though it's redundant), say so and it goes in pointing at `/products`.

Colour tokens throughout: reference's `bg-secondary`/`border-border`/`text-foreground`/`text-muted-foreground` map to NeoCare's `bg-surface-alt`/`border-hairline`/`text-fg`/`text-fg-muted` — already how v2.0's `ProductCard` was built. No colour-token change needed here; §5.1a is where the colour-theme work actually is this round (the hero).

### 5.2b Product detail page (PDP) — NEW

Route: `app/[lang]/product/[slug]/page.tsx`.

Layout (desktop: two columns; mobile: stacked, image first):
- **Gallery** — the size's real photography (pack render where it exists, i.e. Medium; the product cutout otherwise, per the existing `sizes.ts` comment). A single real image is fine; do not generate additional angles.
- **Info column** — size name, weight range (e.g. "4–9 kg"), price (or pack-size selector + price when multiple packs exist, e.g. Medium's 30-pack / 50-pack), an `AddToCartButton`, and the size's descriptive copy (reuse/extend existing size-selector copy — do not write new performance claims).
- Below the fold: link back to the size selector (`#sizes` on the homepage) for visitors who arrived via search/grid without knowing their size yet.

`generateStaticParams` over the 5 slugs; this is a fully static route, no dynamic data fetching.

### 5.3 Trust strip — unchanged
Horizontal band, `--color-bg-brand-soft`. Incepta mark · "Made in Bangladesh" · "Trusted since [TODO: client]". Static, no animation.

### 5.4 New Born — unchanged
Hard visual break, `--color-bg-brand-soft`, "New Born · 0–4 kg" badge, navel-cutout copy, and the endless marquee gallery built 2026-08-18 (§ in `CLAUDE.md`). No changes here.

### 5.5 Size selector — behaviour extended

Range input, 3–25 kg, unchanged recommendation logic (`sizes.ts`, `recommendFor`). The recommended-size card's CTA changes from a dead link to a real `AddToCartButton` for that size's default/first pack variant, plus a "View details" link to the PDP. Alternate-size chips (existing behaviour: every matching size shown, never hidden) link to their own PDPs.

Still: real `<input type="range">`, `aria-valuetext`, visible numeric readout, keyboard-operable.

### 5.6 FAQ — unchanged
Native `<details>`/`<summary>`, `FAQPage` JSON-LD, twelve questions, `[TODO: client]` markers preserved.

### 5.7 Look Closer — relocated, not rebuilt

This is v1.0's S3–S8 pinned product-reveal sequence (turntable + five feature callouts). **Move the section lower in the page (to just above the footer); do not re-architect its internals** — the one-ScrollTrigger/one-pin/one-timeline structure, the mobile stacked-card fallback, the `holdFrame` lock, and the arrow-anchor system all stay exactly as built. Re-run the §9 performance gates and the §8 "pin disabled" a11y check after the move, since its position in the DOM/scroll order has changed even though its internals haven't.

### 5.8 Footer — unchanged, CTA button removed
Logo, contact, DBID, social, copyright 2026. The standalone "Shop Now" button (v1.0 S12) is removed — the Product Grid (§5.2) is now the shopping entry point, and the footer's job goes back to being purely informational.

---

## 6. Cart

Client-side only — a React Context (`CartProvider`) backed by `localStorage`, no server, no database, no payment SDK. Mirrors the reference site's cart *shape* (drawer, item rows, subtotal, checkout button) without adopting its Stripe/`commerce-kit` backend.

### 6.1 State
Cart items: `{ slug, packSize, quantity }[]`. Persist to `localStorage` on every change; hydrate on load (guard against SSR/localStorage mismatch the same way the rest of the site guards client-only state, e.g. the existing scroll-position `useEffect` pattern in `Header.tsx`).

### 6.2 Cart icon
`CartButton` in the header (§5.1): cart glyph + item-count badge (only shown when count > 0), opens the drawer. No page navigation.

### 6.3 Cart drawer
Slide-out panel (reference site's `Sheet`/`CartSidebar` pattern — use whatever primitive this project's `components/ui` already has for overlays, or add a minimal one; do not pull in a new UI kit wholesale).
- Empty state: icon + "Your cart is empty" + a "Continue shopping" action that closes the drawer.
- Populated state: scrollable list of `CartItemRow`s (thumbnail, name, pack size, quantity stepper, remove), a subtotal line (§4.1 placeholder prices, summed via `lib/cart.ts`), a "Shipping and taxes calculated at checkout" note, a checkout button, and a "Continue shopping" text action.

### 6.4 Checkout — placeholder, not payment

`app/[lang]/checkout/page.tsx` is a **static page**, not a payment flow: order summary (read from the cart) plus explicit placeholder copy (e.g. "Checkout isn't live in this demo yet") and a way back to shopping. Non-negotiable 6 applies: nothing on this page may imply money changed hands or an order was placed. No form fields that look like they collect payment details.

---

## 7. Motion guards — unchanged
`src/lib/useCanAnimate.ts`, the measured 1200ms frame-load guard, Lenis desktop-only. See v1.0 §6 (renumbered from here as §6 → §7); no content changes.

---

## 8. Bilingual — unchanged, one addition

- Routes `/en` and `/bn`. **`en` is default** (overrides this spec's original `bn`-default call, per client request 2026-08-18 — the audience is still Bangladeshi; this is a site-presentation choice, not a reversal of who the copy is written for).
- Product names, sizes, prices, cart/checkout strings, and search placeholder text all go through `src/content/{en,bn}.json` like everything else — **do not machine-translate the new Bangla strings**; ship them as `[BN]`-prefixed placeholders until the client supplies real copy, same as any other pending string.
- Never fix product-card, cart-drawer, or search-input widths to English text. Bangla runs 15–30% longer.

---

## 9. Accessibility — WCAG 2.1 AA, unchanged + cart/search additions

- Everything in v1.0 §8 still applies.
- Cart drawer: focus-trapped while open, `Escape` closes it, focus returns to the cart button on close, announced via `role="dialog"`/`aria-label`.
- Cart badge count and "item added" feedback: `aria-live="polite"`, not a silent visual-only change.
- Search results popover: keyboard-navigable (arrow keys / Enter), not mouse-only.
- Quantity steppers: real buttons with `aria-label`s ("Decrease quantity", "Increase quantity"), not bare `+`/`-` glyphs with no label.

---

## 10. Performance gates — unchanged budgets, re-verify after this build

| Metric | Budget |
|---|---|
| LCP, Slow 4G / mid-tier Android | ≤ 2.5s |
| JS, gzipped | ≤ 180 KB |
| Hero image | ≤ 180 KB |
| Turntable total | ≤ 1.5 MB, desktop only, lazy |
| Bangla font, one weight | ≤ 100 KB |
| Total, first view | ≤ 1.2 MB |

The cart/search additions are client components with real interaction logic — watch the JS budget specifically; if `CartProvider` + `ProductGrid` + search push past 180 KB gzipped, code-split the cart drawer and search popover behind their own dynamic imports (both are only needed after a click, never on first paint).

---

## 11. Acceptance criteria

- [ ] Mobile (375px) reviewed and approved for every new surface (grid, PDP, cart drawer, search) before desktop polish
- [ ] Page fully usable with JS disabled (cart/search degrade to "unavailable," not broken — no dead click targets)
- [ ] `prefers-reduced-motion` renders end states, animates nothing (grid, drawer, and Look Closer all respected)
- [ ] Turntable 404s degrade silently to static
- [ ] Navel cutout appears in the New Born section only
- [ ] No hardcoded hex outside `tokens.css`
- [ ] Both locales render; `[BN]` markers visible where copy is pending
- [ ] No price ships as a real figure — every price is a marked placeholder until the client confirms (§4.1)
- [ ] Cart math (line totals, subtotal, quantity changes) is correct and covered by tests, mirroring the reference site's `cart-math.test.ts`
- [ ] Checkout page never implies a completed transaction
- [ ] Total homepage scroll ≤ 900vh after the Product Grid is added
- [ ] Performance gates met on real hardware
- [ ] Keyboard-only traversal reaches every piece of content, including the cart drawer and search results
- [ ] No claim on the page states a figure not confirmed by the client

---

## 12. Never invent a figure — restated

Carried forward from v1.0, now explicitly covering commerce data: no performance percentage, no duration, and (new in v2.0) **no price**. If it isn't in this spec or supplied by the client, it isn't approved — ship the `[TODO: client]` placeholder instead.

---

## 13. Explicitly still out of scope

Restating and sharpening v1.0's non-negotiable 2, since this revision adds a cart and could be misread as opening the door to commerce infrastructure. Still out of scope:

- Real payments (Stripe or otherwise), real checkout, order confirmation/emails/SMS.
- Any backend, database, or CMS for products/orders/inventory.
- User accounts, login, order history.
- `commerce-kit` or any equivalent commerce SDK — the reference repo's *architecture* is not being adopted, only its front-end UX patterns.
- Real Adult Diapers / Baby Wipes / Face Wipes photography, inventory, or purchasable products — those three get placeholder-photography category grids only (§4.2), add-to-cart disabled by default; do not treat them as real SKUs.
- Products/pages for "Parenting Journey" — that dropdown's five stages stay `#` placeholders (§4).

---

## 14. Stop and ask

Do not guess on these:

1. **Real prices** for each size/pack — currently placeholder (§4.1). Needed before this ever goes to production.
2. **"Trusted since [year]"** in the trust strip — no year supplied.
3. **Size ranges** — taken from the live site, overlaps unconfirmed.
4. **FAQ answers** — several restate policy that may be stale.
5. **`holdFrame` index** for Look Closer — depends on the real turntable; still a placeholder.
6. **Any performance figure** for the five features, or any product. Never invent one.
7. **Real photography, names and prices for Adult Diapers, Baby Wipes and Face Wipes** — shipped as placeholder NeoCare-diaper photography for now (§4.2); needed before these read as real products rather than a UX preview.
8. **Whether to enable add-to-cart on the three placeholder categories** — defaults to disabled/"Coming soon" (§4.2) until told otherwise.
9. **Product data (name/image/price) for "Parenting Journey"**, if/when it moves from `#` placeholders to real subpages — out of scope for this revision (§13).

import { ProductCard } from '@/components/product/ProductCard';
import { priceDisplay, productName, type Product } from '@/lib/catalogue';
import type { Dictionary, Locale } from '@/lib/i18n';

/**
 * BUILD_SPEC v3.1 §6.2a — a list of product cards, used by every surface that
 * lists products from more than one category: the homepage best-seller row,
 * the four homepage category rows, and the three category pages.
 *
 * The column count is derived from the number of cards rather than fixed at
 * three. Face Wipes holds two products; its category row holds one once the
 * best seller is excluded. A fixed `sm:grid-cols-3` would leave one or two
 * dead cells in those cases, which `design-taste-frontend`'s bento cell-count
 * rule correctly reads as a planning error rather than a design choice.
 *
 * TWO LAYOUTS, and the choice is a §11 scroll-budget decision, not taste:
 *
 *   - `grid` (default) — the full listing. Two-up on mobile, because one card
 *     per row cost 204vh for a single section at 375px and is what put the
 *     v2.1 homepage over budget. Used where the section IS the page: the
 *     category pages, and the best-seller grid the homepage leads with.
 *   - `scroller` — one swipeable row on mobile, grid from 640px up. Used by
 *     the four homepage category rows, where a two-up grid cost 340vh of a
 *     900vh page to show twelve cards the visitor has not asked for yet.
 *     Measured figures are in CLAUDE.md Stage 7.
 *
 * The scroller is a real overflow region, so it takes `tabIndex={0}` and an
 * accessible name: WCAG 2.1 requires a scrollable region to be reachable and
 * operable from the keyboard, and a `div` that scrolls is not focusable by
 * default (§10).
 *
 * A lone card in a `grid` row is centred at card width rather than left in a
 * two-up row with a dead cell beside it. In a `scroller` row it is NOT: it
 * keeps the same 46% card width as its neighbours, so the four homepage rows
 * line up. Centring it there made the single Face Wipes card render 320px
 * wide — a 320px-tall image, 262px more than a row of three (§11.2).
 *
 * The packshot keeps `alt=""` from §6.1. The product name is visible text
 * inside the same link, so a described image would make a screen reader
 * announce the product twice (§10).
 */
/** `grid` layout: applies at every width. */
const GRID_COLUMNS: Record<number, string> = {
  1: 'mx-auto max-w-xs grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

/**
 * `scroller` layout: `sm:`-prefixed ONLY. Below sm the container is a flex
 * row, where a grid column count is inert but a `max-w-*` is not — that is
 * exactly how the lone Face Wipes card ended up capping its whole row at
 * 320px. Nothing in this map may set a width.
 */
const SCROLLER_COLUMNS: Record<number, string> = {
  1: 'sm:grid-cols-1 sm:max-w-xs',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
};

export function ProductCards({
  products,
  t,
  locale,
  layout = 'grid',
  scrollerLabel,
  className = '',
}: {
  products: Product[];
  t: Dictionary;
  locale: Locale;
  layout?: 'grid' | 'scroller';
  /** Accessible name for the scroll region. Required when layout is scroller. */
  scrollerLabel?: string;
  className?: string;
}) {
  if (products.length === 0) return null;

  const cards = products.map((product) => (
    <ProductCard
      key={product.key}
      product={product}
      name={productName(t, product)}
      priceDisplay={priceDisplay(product, locale)}
      locale={locale}
      quickAddLabel={t.shop.quickAdd}
    />
  ));

  if (layout === 'scroller') {
    /* A row of one has no overflow, so it must NOT take a tab stop: a
       focusable element that does nothing is a dead stop in the tab order
       (§10). Card count is known at render, so this needs no measurement. */
    const scrolls = products.length > 1;
    return (
      <div
        tabIndex={scrolls ? 0 : undefined}
        role={scrolls ? 'group' : undefined}
        aria-label={scrolls ? scrollerLabel : undefined}
        /* -mx-4/px-4 lets the row bleed to the viewport edge on mobile so the
           last card is visibly clipped — the affordance that says "swipe" —
           while the first card still lines up with the page gutter.
           snap-x aligns a `snap-start` item to the SCROLLPORT edge, which
           ignores padding — so on load the browser scrolled the row by 16px to
           seat card one, leaving every card 16px left of its own heading.
           `scroll-px-4` makes the snap area respect the gutter. */
        className={`-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:snap-none sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 sm:pb-0 sm:scroll-px-0 ${
          SCROLLER_COLUMNS[products.length] ?? 'sm:grid-cols-3'
        } ${className}`}
      >
        {cards.map((card, i) => (
          <div
            key={products[i]!.key}
            className="w-[46%] shrink-0 snap-start sm:w-auto"
          >
            {card}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`grid gap-x-6 gap-y-10 ${GRID_COLUMNS[products.length] ?? 'grid-cols-2 sm:grid-cols-3'} ${className}`}
    >
      {cards}
    </div>
  );
}

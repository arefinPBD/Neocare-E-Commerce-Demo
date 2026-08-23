import type { NavItem } from '@/components/nav/Header';
import type { SearchProduct } from '@/components/nav/SearchInput';
import type { Dictionary, Locale } from '@/lib/i18n';
import { priceDisplay, productName, PRODUCTS } from '@/lib/catalogue';

/**
 * Nav and search data, extracted from the homepage so the layout can build it
 * once for every route.
 *
 * Until v3.0 only `app/[lang]/page.tsx` rendered a Header, so `/products`,
 * `/product/[slug]`, `/checkout` and `/category/[slug]` shipped with no
 * navigation, no cart button, no language toggle and no footer at all. §5.1
 * puts a promo bar "above the header" and §5.3 defines a commerce container
 * for the PDP and cart, both of which presuppose a header on those routes.
 * The chrome now lives in `app/[lang]/layout.tsx` and these builders feed it.
 *
 * BUILD_SPEC v3.0 §5.2 item 3 — the nav items are unchanged from v2.1. Do not
 * add or remove one. Link targets are unchanged too: Diapers Line ->
 * `/products`, the other three product categories -> `/category/{slug}`, and
 * every Parenting Journey item stays `#` (§13, out of scope).
 */
export function buildNav(locale: Locale, t: Dictionary): NavItem[] {
  return [
    { href: `/${locale}#features`, label: t.nav.features },
    {
      href: `/${locale}/products`,
      label: t.nav.products,
      children: [
        { href: `/${locale}/products`, label: t.nav.productsDiaperLine },
        {
          href: `/${locale}/category/adult-diapers`,
          label: t.nav.productsAdultDiapers,
        },
        {
          href: `/${locale}/category/baby-wipes`,
          label: t.nav.productsBabyWipes,
        },
        {
          href: `/${locale}/category/face-wipes`,
          label: t.nav.productsFaceWipes,
        },
      ],
    },
    {
      href: '#',
      label: t.nav.journey,
      children: [
        { href: '#', label: t.nav.journeyConception },
        { href: '#', label: t.nav.journeyPregnancy },
        { href: '#', label: t.nav.journeyNewborn },
        { href: '#', label: t.nav.journeyBaby },
        { href: '#', label: t.nav.journeyFamily },
      ],
    },
    { href: `/${locale}#newborn`, label: t.nav.newborn },
    { href: `/${locale}#sizes`, label: t.nav.sizes },
    { href: `/${locale}#faq`, label: t.nav.faq },
  ];
}

/**
 * Every product in the catalogue, for the header's client-side search filter.
 *
 * BUILD_SPEC v3.1 §5.2 — was the five diaper sizes only, which meant searching
 * "wipes" returned nothing on a site that sells four kinds of them. It now
 * covers all of `PRODUCTS`; the filter itself is unchanged and still runs
 * entirely client-side with no backend.
 *
 * A single price renders as one figure; a product with several pack variants
 * renders as `min - max`, matching DESIGN.md §6.3.
 */
export function buildSearchProducts(
  locale: Locale,
  t: Dictionary,
): SearchProduct[] {
  return PRODUCTS.map((product) => ({
    slug: product.slug,
    name: productName(t, product),
    price: priceDisplay(product, locale),
    image: product.image,
    imageW: product.imageW,
    imageH: product.imageH,
  }));
}

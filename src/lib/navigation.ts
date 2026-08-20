import type { NavItem } from '@/components/nav/Header';
import type { SearchProduct } from '@/components/nav/SearchInput';
import type { Dictionary, Locale } from '@/lib/i18n';
import { fmtMoney } from '@/lib/numerals';
import { priceRange, SIZES } from '@/lib/sizes';

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
 * The five real diaper sizes, for the header's client-side search filter.
 *
 * A single price renders as one figure; a product with several pack variants
 * renders as `min - max`, matching DESIGN.md §6.3.
 */
export function buildSearchProducts(
  locale: Locale,
  t: Dictionary,
): SearchProduct[] {
  /* The en dash here is the existing v2.1 rendering, kept byte-identical.
   * design-taste-frontend would replace it with a hyphen, but this string
   * renders in BOTH locales and the client scoped copy changes to English via
   * an approval diff. It is proposed there instead of changed here. */
  return SIZES.map((size) => {
    const [min, max] = priceRange(size);
    return {
      slug: size.slug,
      name: t.sizes.names[size.key],
      price:
        min === max
          ? fmtMoney(min, locale)
          : `${fmtMoney(min, locale)} – ${fmtMoney(max, locale)}`,
      image: size.image,
      imageW: size.imageW,
      imageH: size.imageH,
    };
  });
}

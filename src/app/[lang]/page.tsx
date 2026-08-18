import { lang } from 'next/root-params';

import { Header, type NavItem } from '@/components/nav/Header';
import { LanguageToggle } from '@/components/nav/LanguageToggle';
import { Faq } from '@/components/sections/Faq';
import { Footer } from '@/components/sections/Footer';
import { Hero } from '@/components/sections/Hero';
import { NewbornSection } from '@/components/sections/NewbornSection';
import { ProductGrid } from '@/components/sections/ProductGrid';
import { ProductSequence } from '@/components/sections/ProductSequence';
import { SizeSelector } from '@/components/sections/SizeSelector';
import { TrustStrip } from '@/components/sections/TrustStrip';
import { getDictionary, isLocale } from '@/lib/i18n';
import { priceRange, SIZES } from '@/lib/sizes';
import { fmtMoney } from '@/lib/numerals';

/* BUILD_SPEC v2.0 §5.0 — section order: Hero, Shop/Product Grid, Trust strip,
 * New Born, Size selector, FAQ, Look Closer (moved from right after the
 * hero), Footer. */
export default async function Page() {
  const current = await lang();
  if (!current || !isLocale(current)) return null;

  const t = getDictionary(current);

  const nav: NavItem[] = [
    { href: '#features', label: t.nav.features },
    {
      href: `/${current}/products`,
      label: t.nav.products,
      children: [
        { href: `/${current}/products`, label: t.nav.productsDiaperLine },
        { href: `/${current}/category/adult-diapers`, label: t.nav.productsAdultDiapers },
        { href: `/${current}/category/baby-wipes`, label: t.nav.productsBabyWipes },
        { href: `/${current}/category/face-wipes`, label: t.nav.productsFaceWipes },
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
    { href: '#newborn', label: t.nav.newborn },
    { href: '#sizes', label: t.nav.sizes },
    { href: '#faq', label: t.nav.faq },
  ];

  const searchProducts = SIZES.map((size) => {
    const [min, max] = priceRange(size);
    const priceDisplay =
      min === max
        ? fmtMoney(min, current)
        : `${fmtMoney(min, current)} – ${fmtMoney(max, current)}`;
    return {
      slug: size.slug,
      name: t.sizes.names[size.key],
      price: priceDisplay,
      image: size.image,
      imageW: size.imageW,
      imageH: size.imageH,
    };
  });

  return (
    <>
      <Header
        nav={nav}
        menuLabel={t.nav.openMenu}
        navLabel={t.nav.mainNav}
        logoAlt={t.nav.logoAlt}
        locale={current}
        searchProducts={searchProducts}
        searchPlaceholder={t.search.placeholder}
        searchAriaLabel={t.search.ariaLabel}
        searchNoResults={t.search.noResults}
        cartLabel={t.cart.title}
        toggle={
          <LanguageToggle current={current} label={t.nav.switchLanguage} />
        }
      />

      <main id="main">
        <Hero t={t} />
        <ProductGrid t={t} locale={current} />
        <TrustStrip t={t} />
        <NewbornSection t={t} />
        <SizeSelector t={t} locale={current} />
        <Faq t={t} />
        <ProductSequence t={t} />
      </main>

      <Footer t={t} />
    </>
  );
}

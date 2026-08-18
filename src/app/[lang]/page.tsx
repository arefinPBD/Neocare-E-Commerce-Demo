import { lang } from 'next/root-params';

import { Header, type NavItem } from '@/components/nav/Header';
import { LanguageToggle } from '@/components/nav/LanguageToggle';
import { Faq } from '@/components/sections/Faq';
import { Footer } from '@/components/sections/Footer';
import { Hero } from '@/components/sections/Hero';
import { NewbornSection } from '@/components/sections/NewbornSection';
import { ProductSequence } from '@/components/sections/ProductSequence';
import { ShopCta } from '@/components/sections/ShopCta';
import { SizeSelector } from '@/components/sections/SizeSelector';
import { TrustStrip } from '@/components/sections/TrustStrip';
import { getDictionary, isLocale } from '@/lib/i18n';

/* Stage 2 — S0..S12 + footer. Mobile is the primary design; no GSAP, no pin,
 * no scrub, no Lenis. Desktop styling here is only what falls out of the
 * mobile-first utilities. */
export default async function Page() {
  const current = await lang();
  if (!current || !isLocale(current)) return null;

  const t = getDictionary(current);

  const nav: NavItem[] = [
    { href: '#features', label: t.nav.features },
    {
      href: '#',
      label: t.nav.products,
      children: [
        { href: '#', label: t.nav.productsDiaperLine },
        { href: '#', label: t.nav.productsAdultDiapers },
        { href: '#', label: t.nav.productsBabyWipes },
        { href: '#', label: t.nav.productsFaceWipes },
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

  return (
    <>
      <Header
        nav={nav}
        menuLabel={t.nav.openMenu}
        navLabel={t.nav.mainNav}
        logoAlt={t.nav.logoAlt}
        toggle={
          <LanguageToggle current={current} label={t.nav.switchLanguage} />
        }
      />

      <main id="main">
        <Hero t={t} />
        <TrustStrip t={t} />
        <ProductSequence t={t} />
        <NewbornSection t={t} />
        <SizeSelector t={t} locale={current} />
        <Faq t={t} />
        <ShopCta t={t} />
      </main>

      <Footer t={t} />
    </>
  );
}

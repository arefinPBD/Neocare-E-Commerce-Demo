import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Poppins, Hind_Siliguri } from 'next/font/google';
import { lang } from 'next/root-params';

import '../globals.css';
import { CartProvider } from '@/components/cart/CartContext';
import { CartSidebar } from '@/components/cart/CartSidebar';
import { Header } from '@/components/nav/Header';
import { LanguageToggle } from '@/components/nav/LanguageToggle';
import { PromoBar } from '@/components/nav/PromoBar';
import { Footer } from '@/components/sections/Footer';
import { LOCALES, getDictionary, isLocale } from '@/lib/i18n';
import { buildNav, buildSearchProducts } from '@/lib/navigation';

/* DESIGN.md §2 — one weight per script for the demo: 400 and 600.
 *
 * DEVIATION FROM BUILD_SPEC §3 ("preload the active locale's font only"):
 * next/font's `preload` is resolved at build time, and both locales share this
 * single root layout, so it cannot vary per request. Splitting into two root
 * layouts would remove the [lang] segment that next/root-params requires (§7).
 *
 * So: Poppins preloads (it renders numerals and the toggle in BOTH locales per
 * the numeral decision in src/lib/numerals.ts), Hind Siliguri does not, and
 * relies on display:swap. Revisit in Stage 4 with the measured byte cost —
 * DESIGN.md §2 budgets a single Bengali weight at 80–120 KB and asks for a
 * measurement before adding weights. */
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-poppins',
  preload: true,
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-hind-siliguri',
  preload: false,
});

const SITE_URL = 'https://neocarebd.com';

export async function generateStaticParams() {
  return LOCALES.map((l) => ({ lang: l }));
}

/** Unknown locales 404 rather than rendering an untranslated shell. */
export const dynamicParams = false;

export async function generateMetadata(): Promise<Metadata> {
  const current = await lang();
  if (!current || !isLocale(current)) return {};
  const t = getDictionary(current);

  return {
    metadataBase: new URL(SITE_URL),
    title: t.meta.title,
    description: t.meta.description,
    // BUILD_SPEC §7 — reciprocal hreflang on both routes.
    alternates: {
      canonical: `/${current}`,
      languages: {
        en: '/en',
        bn: '/bn',
        'x-default': '/bn',
      },
    },
  };
}

export default async function RootLayout(props: LayoutProps<'/[lang]'>) {
  const current = await lang();
  if (!current || !isLocale(current)) notFound();

  const t = getDictionary(current);

  return (
    <html
      lang={current}
      className={`${poppins.variable} ${hindSiliguri.variable}`}
    >
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-soft focus:bg-surface focus:px-4 focus:py-3 focus:text-fg focus:shadow-raised"
        >
          {t.nav.skipToContent}
        </a>
        <CartProvider>
          {/* BUILD_SPEC v3.0 §5.1 — the promo bar is a sibling of the header,
              not a wrapper around it. It scrolls away; the header sticks
              beneath it. Wrapping both in one sticky container would pin the
              bar too, which §5.1 explicitly forbids.

              Site chrome lives here rather than per page as of v3.0: before
              this, only the homepage rendered a Header or Footer, so the PDP,
              the product grid, the cart page and the placeholder category
              pages had no navigation at all. §5.1-§5.3 assume chrome on every
              route. */}
          <PromoBar t={t} />
          <Header
            nav={buildNav(current, t)}
            menuLabel={t.nav.openMenu}
            navLabel={t.nav.mainNav}
            logoAlt={t.nav.logoAlt}
            locale={current}
            searchProducts={buildSearchProducts(current, t)}
            searchPlaceholder={t.search.placeholder}
            searchAriaLabel={t.search.ariaLabel}
            searchNoResults={t.search.noResults}
            cartLabel={t.cart.title}
            toggle={
              <LanguageToggle current={current} label={t.nav.switchLanguage} />
            }
          />

          {props.children}

          <Footer t={t} />
          <CartSidebar t={t} locale={current} />
        </CartProvider>
      </body>
    </html>
  );
}

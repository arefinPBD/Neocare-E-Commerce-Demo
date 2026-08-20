'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';

import { CartButton } from '@/components/nav/CartButton';
import { SearchInput, type SearchProduct } from '@/components/nav/SearchInput';

import logo from '../../../public/brand/logo.svg';

export interface NavItem {
  href: string;
  label: string;
  children?: NavItem[];
}

/**
 * S0 — sticky. Transparent over the hero, then --nc-paper + --shadow-sm once
 * 80px is scrolled.
 *
 * BUILD_SPEC v3.0 §5.2 — restructured to the reference kit's bar:
 *   1. 96px (h-24) at EVERY width, replacing h-16 md:h-20. One height, not
 *      two, and it is what gives the upper half its air. Hero's negative top
 *      margin follows it to a single -mt-24.
 *   2. Three zones: flex-1 left (logo, plus nav on desktop), flex-1 right
 *      (search, cart, language, mobile disclosure).
 *   4. Nav links are type-small font-semibold text-fg-muted hover:text-fg with
 *      no pill background. The old text-brand hover:bg-surface-brand treatment
 *      is gone from the top-level links; dropdown PANELS keep their existing
 *      rounded-card + shadow-float chrome, which §5.2 leaves alone.
 *
 * Everything else here is unchanged and deliberately so: sticky behaviour, the
 * 80px transparent-to-solid switch, the <noscript> solid fallback, the native
 * <details> mobile disclosure, SearchInput, CartButton and LanguageToggle.
 *
 * The transparent state is applied by JS. With JS disabled the <noscript>
 * block forces the solid state, so the logo and controls stay legible against
 * page content instead of vanishing onto white (§10: usable with JS disabled).
 * Solid is therefore the safe default in the server HTML.
 *
 * The mobile menu is a native <details>/<summary> disclosure: it opens without
 * JS, is keyboard-operable for free, and needs no focus-trap.
 *
 * BUILD_SPEC v2.0 §5.1 — cart icon now genuinely opens the drawer (§6), and a
 * search input filters the (small, real) product catalogue.
 */
export function Header({
  toggle,
  nav,
  menuLabel,
  navLabel,
  logoAlt,
  locale,
  searchProducts,
  searchPlaceholder,
  searchAriaLabel,
  searchNoResults,
  cartLabel,
}: {
  toggle: ReactNode;
  nav: NavItem[];
  menuLabel: string;
  /** Landmark name. Distinct from menuLabel, which names the toggle. */
  navLabel: string;
  logoAlt: string;
  locale: string;
  searchProducts: SearchProduct[];
  searchPlaceholder: string;
  searchAriaLabel: string;
  searchNoResults: string;
  cartLabel: string;
}) {
  const [atTop, setAtTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <noscript>
        <style
          dangerouslySetInnerHTML={{
            __html:
              '.site-header{background-color:var(--color-bg);box-shadow:var(--shadow-sm)}',
          }}
        />
      </noscript>

      <header
        className={
          'site-header sticky top-0 z-40 transition-[background-color,box-shadow] duration-[--dur-base] ease-[--ease-out] ' +
          (atTop ? 'bg-transparent' : 'bg-surface shadow-card')
        }
      >
        <div className="mx-auto flex h-24 max-w-(--container-content) items-center justify-between gap-2 px-4 md:px-6">
          {/* Left zone: logo, then the nav from lg up. */}
          <div className="flex flex-1 items-center gap-8">
            {/* shrink-0 is load-bearing. The left zone is flex-1, so once the
                nav beside it is ~640px wide the logo is the flex item that
                gives, and `w-auto` on the <img> collapses it to zero width
                rather than overflowing. It rendered at 0x44 before this. */}
            <Link
              href={`/${locale}`}
              className="flex min-h-11 shrink-0 items-center rounded-soft"
              aria-label={logoAlt}
            >
              {/* No `priority`: the hero image is the LCP element, and a second
                  preload only competes with it for the first connection. */}
              <Image src={logo} alt={logoAlt} className="h-9 w-auto md:h-11" />
            </Link>

          {/* Desktop nav. lg, not md: at 768px the six items plus the search
              field do not fit on one line, and a two-line nav bar is broken.
              Below lg the <details> disclosure in the right zone serves the
              same items, so nothing becomes unreachable. */}
          <nav aria-label={navLabel} className="hidden lg:block">
            <ul className="flex items-center space-x-8">
              {nav.map((item) =>
                item.children ? (
                  <li key={item.label} className="group relative">
                    <a
                      href={item.href}
                      className="inline-flex min-h-11 items-center whitespace-nowrap py-2 type-small font-semibold text-fg-muted transition-colors duration-[--dur-fast] hover:text-fg"
                    >
                      {item.label}
                    </a>
                    <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition-[opacity,visibility] duration-[--dur-fast] ease-[--ease-out] group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      <ul className="min-w-48 -translate-y-1 rounded-card border border-hairline bg-surface p-2 shadow-float transition-transform duration-[--dur-fast] ease-[--ease-out] group-hover:translate-y-0 group-focus-within:translate-y-0">
                        {item.children.map((child) => (
                          <li key={child.label}>
                            <a
                              href={child.href}
                              className="flex min-h-11 items-center rounded-soft px-3 py-2 type-small text-fg transition-colors duration-[--dur-fast] hover:bg-surface-brand"
                            >
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ) : (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="inline-flex min-h-11 items-center whitespace-nowrap py-2 type-small font-semibold text-fg-muted transition-colors duration-[--dur-fast] hover:text-fg"
                    >
                      {item.label}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </nav>
          </div>

          {/* Right zone. */}
          <div className="flex flex-1 items-center justify-end gap-1">
            <SearchInput
              locale={locale}
              products={searchProducts}
              placeholder={searchPlaceholder}
              ariaLabel={searchAriaLabel}
              noResults={searchNoResults}
              className="hidden w-48 lg:block"
            />
            <CartButton label={cartLabel} />
            {toggle}

            <details className="relative lg:hidden [&[open]>summary>svg]:rotate-90">
              <summary
                aria-label={menuLabel}
                className="inline-flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-pill text-brand transition-colors duration-[--dur-fast] hover:bg-surface-brand [&::-webkit-details-marker]:hidden"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  aria-hidden="true"
                  className="transition-transform duration-[--dur-base] ease-[--ease-out]"
                >
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              </summary>

              <nav
                aria-label={navLabel}
                className="absolute right-0 top-full mt-2 min-w-64 rounded-card border border-hairline bg-surface p-2 shadow-float"
              >
                <div className="p-1 pb-2">
                  <SearchInput
                    locale={locale}
                    products={searchProducts}
                    placeholder={searchPlaceholder}
                    ariaLabel={searchAriaLabel}
                    noResults={searchNoResults}
                  />
                </div>
                <ul>
                  {nav.map((item) =>
                    item.children ? (
                      <li key={item.label}>
                        <details className="[&[open]>summary>svg]:rotate-90">
                          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-soft px-3 py-2 text-fg transition-colors duration-[--dur-fast] hover:bg-surface-brand [&::-webkit-details-marker]:hidden">
                            {item.label}
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              aria-hidden="true"
                              className="transition-transform duration-[--dur-base] ease-[--ease-out]"
                            >
                              <path d="M9 6l6 6-6 6" />
                            </svg>
                          </summary>
                          <ul className="pl-3">
                            {item.children.map((child) => (
                              <li key={child.label}>
                                <a
                                  href={child.href}
                                  className="flex min-h-11 items-center rounded-soft px-3 py-2 text-fg transition-colors duration-[--dur-fast] hover:bg-surface-brand"
                                >
                                  {child.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </details>
                      </li>
                    ) : (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          className="flex min-h-11 items-center rounded-soft px-3 py-2 text-fg transition-colors duration-[--dur-fast] hover:bg-surface-brand"
                        >
                          {item.label}
                        </a>
                      </li>
                    ),
                  )}
                </ul>
              </nav>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';

import logo from '../../../public/brand/logo.svg';

export interface NavItem {
  href: string;
  label: string;
}

/**
 * S0 — sticky. Transparent over the hero, then --nc-paper + --shadow-sm once
 * 80px is scrolled. 64px tall on mobile, 80px on desktop.
 *
 * The transparent state is applied by JS. With JS disabled the <noscript>
 * block forces the solid state, so the logo and controls stay legible against
 * page content instead of vanishing onto white (§10: usable with JS disabled).
 * Solid is therefore the safe default in the server HTML.
 *
 * The mobile menu is a native <details>/<summary> disclosure: it opens without
 * JS, is keyboard-operable for free, and needs no focus-trap.
 *
 * No cart icon. BUILD_SPEC §1 puts cart out of scope; an icon that leads
 * nowhere is worse than its absence.
 */
export function Header({
  toggle,
  nav,
  menuLabel,
  navLabel,
  logoAlt,
}: {
  toggle: ReactNode;
  nav: NavItem[];
  menuLabel: string;
  /** Landmark name. Distinct from menuLabel, which names the toggle. */
  navLabel: string;
  logoAlt: string;
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
        <div className="mx-auto flex h-16 max-w-(--container-content) items-center justify-between gap-2 px-4 md:h-20 md:px-6">
          <Link
            href="#main"
            className="flex min-h-11 items-center rounded-soft"
            aria-label={logoAlt}
          >
            {/* No `priority`: the hero image is the LCP element, and a second
                preload only competes with it for the first connection. */}
            <Image src={logo} alt={logoAlt} className="h-9 w-auto md:h-11" />
          </Link>

          {/* Desktop nav (S0: centre, desktop only). */}
          <nav aria-label={navLabel} className="hidden md:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-flex min-h-11 items-center rounded-pill px-3 py-2 type-small font-semibold text-brand transition-colors duration-[--dur-fast] hover:bg-surface-brand"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            {toggle}

            <details className="relative md:hidden [&[open]>summary>svg]:rotate-90">
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
                className="absolute right-0 top-full mt-2 min-w-52 rounded-card border border-hairline bg-surface p-2 shadow-float"
              >
                <ul>
                  {nav.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="flex min-h-11 items-center rounded-soft px-3 py-2 text-fg transition-colors duration-[--dur-fast] hover:bg-surface-brand"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}

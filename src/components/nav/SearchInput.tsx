'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useId, useRef, useState } from 'react';

export interface SearchProduct {
  slug: string;
  name: string;
  price: string;
  image: string;
  imageW: number;
  imageH: number;
}

/**
 * BUILD_SPEC §5.1 — client-side filter over the (tiny, five-item) product
 * catalogue. No backend/API call. Results are real <Link>s, so they're
 * reachable by Tab even without the arrow-key roving-focus a fuller search
 * widget would have (§9: keyboard-navigable, not mouse-only).
 */
export function SearchInput({
  locale,
  products,
  placeholder,
  ariaLabel,
  noResults,
  className = '',
}: {
  locale: string;
  products: SearchProduct[];
  placeholder: string;
  ariaLabel: string;
  noResults: string;
  className?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const results =
    query.trim().length === 0
      ? []
      : products.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <div className="relative">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          role="combobox"
          aria-expanded={open && query.trim().length > 0}
          aria-controls={listId}
          autoComplete="off"
          /* `outline-none` was here, which opted this input out of the
             global :focus-visible floor in globals.css and left a 1px border
             colour change as the only focus cue. §10 requires a visible focus
             indicator on every control, so the floor is allowed through and
             the border change is now an additional cue rather than the only
             one. */
          className="h-11 w-full min-w-0 rounded-pill border border-hairline bg-surface py-2 pl-9 pr-3 type-small text-fg transition-colors duration-[--dur-fast] focus-visible:border-brand"
        />
      </div>

      {open && query.trim().length > 0 && (
        <ul
          id={listId}
          className="absolute left-0 top-full z-50 mt-2 max-h-80 w-full min-w-64 overflow-y-auto rounded-card border border-hairline bg-surface p-2 shadow-float"
        >
          {results.length === 0 ? (
            <li className="px-3 py-3 type-small text-fg-muted">{noResults}</li>
          ) : (
            results.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/${locale}/product/${p.slug}`}
                  onClick={() => setOpen(false)}
                  /* hover-zoom on the ROW, not on the thumbnail: the row is
                     what the pointer is aiming at, and the thumbnail keeps
                     its own overflow-hidden to crop the zoom. */
                  className="hover-zoom flex items-center gap-3 rounded-soft p-2 transition-colors duration-[--dur-fast] hover:bg-surface-brand"
                >
                  <span className="h-10 w-10 shrink-0 overflow-hidden rounded-soft bg-surface-alt">
                    <Image
                      src={p.image}
                      alt=""
                      width={p.imageW}
                      height={p.imageH}
                      sizes="40px"
                      className="h-10 w-10 object-contain"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate type-small font-semibold text-fg">
                      {p.name}
                    </span>
                    <span className="block type-small text-fg-muted">{p.price}</span>
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

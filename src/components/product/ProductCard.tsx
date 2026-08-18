import Image from 'next/image';
import Link from 'next/link';

import { AddToCartButton } from '@/components/product/AddToCartButton';
import type { SizeRow } from '@/lib/sizes';

/**
 * BUILD_SPEC §5.2 — square image, name + price below, whole card links to
 * the PDP. Quick-add only appears for single-pack products (§5.2's
 * `singleVariant` gate, mirroring the reference site's product-card.tsx) —
 * multi-pack products (Medium) must go through the PDP to choose a pack.
 *
 * §5.2a (v2.1) — quick-add is a circular icon button, bottom-left of the
 * image, `opacity-0 group-hover:opacity-100` on desktop and always visible
 * on mobile — matching the reference's quick-add-button.tsx exactly (shape,
 * position, hover behaviour). It sits inside the image container, nested in
 * the `<Link>` like the reference's own markup; `preventDefault`/
 * `stopPropagation` in AddToCartButton keep a click from also navigating.
 */
export function ProductCard({
  size,
  name,
  priceDisplay,
  locale,
  quickAddLabel,
  badge,
  disabledAddToCart = false,
  hrefBase = 'product',
}: {
  size: SizeRow;
  name: string;
  priceDisplay: string;
  locale: string;
  quickAddLabel: string;
  badge?: string;
  disabledAddToCart?: boolean;
  hrefBase?: string;
}) {
  const singlePack = size.packs.length === 1 ? size.packs[0] : null;

  return (
    <Link href={`/${locale}/${hrefBase}/${size.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-tight border border-hairline bg-surface-alt">
        {badge && (
          <span className="absolute left-3 top-3 z-10 rounded-pill bg-surface px-3 py-1 type-small font-semibold text-fg-muted shadow-card">
            {badge}
          </span>
        )}
        <Image
          src={size.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain p-8 transition-transform duration-[--dur-base] ease-[--ease-out] group-hover:scale-105"
        />
        {singlePack && (
          <AddToCartButton
            sizeKey={size.key}
            pack={singlePack}
            disabled={disabledAddToCart}
            aria-label={quickAddLabel}
            className="!min-h-9 !min-w-9 absolute bottom-3 left-3 z-10 rounded-full !px-0 !py-0 opacity-100 shadow-card transition-[opacity,transform] duration-[--dur-fast] hover:scale-110 active:scale-95 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h2l2.4 12.2a2 2 0 0 0 2 1.8h8.2a2 2 0 0 0 2-1.6L21 8H6" />
              <circle cx="10" cy="21" r="1" />
              <circle cx="17" cy="21" r="1" />
            </svg>
          </AddToCartButton>
        )}
      </div>
      <div className="mt-3">
        <p className="type-body font-semibold text-fg">{name}</p>
        <p className="type-body text-fg-muted">{priceDisplay}</p>
      </div>
    </Link>
  );
}

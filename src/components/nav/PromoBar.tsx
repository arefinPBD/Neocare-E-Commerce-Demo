import type { Dictionary } from '@/lib/i18n';

/**
 * BUILD_SPEC v3.0 §5.1 — a full-width band above the header.
 *
 * NOT sticky. It scrolls away and the header sticks beneath it, so the two are
 * deliberately siblings rather than being wrapped in a shared sticky container.
 *
 * The reference kit fills this bar with a free-delivery threshold. NeoCare has
 * no such offer, and §1 non-negotiable 7 forbids inventing a delivery
 * threshold, discount or shipping promise. So `promo.text` ships as an empty
 * string and this component renders nothing at all — no empty band, no
 * reserved height, no layout shift. The moment the client supplies copy, the
 * bar appears with no other change.
 *
 * Contrast: --nc-green-900 on --color-text-inverse measures 13.6:1.
 */
export function PromoBar({ t }: { t: Dictionary }) {
  const text = t.promo.text.trim();
  if (!text) return null;

  return (
    <div className="bg-green-900 px-4 py-2 text-center type-small font-semibold text-fg-inverse">
      {text}
    </div>
  );
}

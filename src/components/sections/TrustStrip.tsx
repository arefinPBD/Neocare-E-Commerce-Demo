import type { Dictionary } from '@/lib/i18n';

/* S2 — horizontal band on --color-bg-brand-soft. Static, no animation.
 *
 * The spec's "Incepta mark" is not in the asset set, so the maker is set in
 * type rather than substituted with a lookalike logo. */
export function TrustStrip({ t }: { t: Dictionary }) {
  const items = [t.trust.maker, t.trust.madeIn, t.trust.since];

  return (
    <section
      aria-label={t.trust.maker}
      className="bg-surface-brand py-8 md:py-10"
    >
      <ul className="mx-auto flex max-w-(--container-content) flex-col items-center gap-3 px-4 text-center md:flex-row md:justify-center md:gap-10 md:px-6">
        {items.map((item, i) => (
          <li
            key={i}
            className="type-small font-semibold text-green-800 md:type-body"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

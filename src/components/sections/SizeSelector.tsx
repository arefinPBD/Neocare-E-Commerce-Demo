'use client';

import Image from 'next/image';
import { useId, useState } from 'react';

import type { Dictionary, Locale } from '@/lib/i18n';
import { fmt, fmtWeight } from '@/lib/numerals';
import {
  recommendFor,
  WEIGHT_MAX,
  WEIGHT_MIN,
  WEIGHT_STEP,
  type SizeRow,
} from '@/lib/sizes';

/**
 * S10 — real <input type="range">, never a div with drag handlers (§5 S10).
 * aria-valuetext carries the spoken value; a visible numeric readout sits
 * beside it. Keyboard-operable for free.
 *
 * Overlapping ranges are resolved by band centrality — see lib/sizes.ts. The
 * primary card is one size; every other size that also covers the weight is
 * listed underneath rather than hidden.
 */
export function SizeSelector({ t, locale }: { t: Dictionary; locale: Locale }) {
  const [weight, setWeight] = useState(6);
  const sliderId = useId();
  const { primary, alternates } = recommendFor(weight);

  const name = (row: SizeRow) => t.sizes.names[row.key];
  const range = (row: SizeRow) =>
    t.sizes.weightRange
      .replace('{min}', fmtWeight(row.min, locale))
      .replace('{max}', fmtWeight(row.max, locale));

  const pct = Math.max(
    0,
    Math.min(100, ((weight - WEIGHT_MIN) / (WEIGHT_MAX - WEIGHT_MIN)) * 100)
  );

  const handleWeightChange = (val: string) => {
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setWeight(parsed);
    }
  };

  return (
    <section
      id="sizes"
      aria-labelledby="sizes-heading"
      className="section-rhythm bg-surface"
    >
      <div className="mx-auto max-w-(--container-content) px-4 md:px-6">
        <h2 id="sizes-heading" className="type-h1 measure text-fg">
          {t.sizes.title}
        </h2>
        <p className="type-body-lg measure mt-4 text-fg-muted">
          {t.sizes.intro}
        </p>

        <div className="mt-8">
          <label htmlFor={sliderId} className="type-body font-semibold text-fg">
            {t.sizes.sliderLabel}
          </label>

          <output
            htmlFor={sliderId}
            aria-live="polite"
            className="mt-2 block type-h2 font-semibold text-brand"
          >
            {fmtWeight(weight, locale)} {t.sizes.unit}
          </output>

          <input
            id={sliderId}
            type="range"
            min={WEIGHT_MIN}
            max={WEIGHT_MAX}
            step={WEIGHT_STEP}
            value={weight}
            onChange={(e) => handleWeightChange(e.target.value)}
            onInput={(e) => handleWeightChange((e.target as HTMLInputElement).value)}
            aria-valuetext={`${fmtWeight(weight, locale)} ${t.sizes.unitLong}`}
            className="size-slider mt-4 h-3 w-full cursor-pointer rounded-pill accent-[var(--color-primary)]"
            style={{
              background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${pct}%, var(--color-hairline) ${pct}%, var(--color-hairline) 100%)`,
            }}
          />

          <div className="flex justify-between type-small text-fg-muted">
            <span>
              {fmtWeight(WEIGHT_MIN, locale)} {t.sizes.unit}
            </span>
            <span>
              {fmtWeight(WEIGHT_MAX, locale)} {t.sizes.unit}
            </span>
          </div>
        </div>

        {/* Recommended size */}
        <article className="hover-card mt-8 overflow-hidden rounded-card border border-hairline bg-surface-alt shadow-card">
          <div className="flex items-center gap-4 p-6">
            <div className="hover-zoom h-24 w-24 shrink-0 overflow-hidden rounded-soft">
              <Image
                src={primary.image}
                alt={t.sizes.packAlt.replace('{size}', name(primary))}
                width={primary.imageW}
                height={primary.imageH}
                sizes="96px"
                loading="lazy"
                className="h-24 w-24 object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="type-small font-semibold uppercase text-green-700">
                {t.sizes.recommended}
              </p>
              <p className="type-h2 font-semibold text-fg">{name(primary)}</p>
              <p className="type-body text-fg-muted">{range(primary)}</p>
              <p className="type-small mt-1 text-fg-muted">
                {t.sizes.packLabel}:{' '}
                {primary.packs.map((p) => fmt(p, locale)).join(' · ')}{' '}
                {t.sizes.packUnit}
              </p>
            </div>
          </div>
        </article>

        {/* Every other size whose range also covers this weight. */}
        {alternates.length > 0 && (
          <div className="mt-4">
            <p className="type-small font-semibold text-fg-muted">
              {t.sizes.alsoFits}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {alternates.map((row) => (
                <li key={row.key}>
                  <span className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-hairline bg-surface px-4 py-2 type-small text-fg transition-colors duration-[--dur-fast] ease-[--ease-out] hover:border-brand hover:bg-surface-brand">
                    <strong className="font-semibold">{name(row)}</strong>
                    <span className="text-fg-muted">{range(row)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="type-small measure mt-6 text-fg-muted">
          {t.sizes.confirmNote}
        </p>
      </div>
    </section>
  );
}

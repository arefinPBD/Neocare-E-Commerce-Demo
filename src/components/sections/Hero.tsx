import { Button } from '@/components/ui/Button';
import type { Dictionary } from '@/lib/i18n';

/**
 * BUILD_SPEC §5.1a (v2.1) — restructured to match the reference site's
 * text-hero layout: contained width, left-aligned text column, no full-bleed
 * foreground photo.
 *
 * The v1.0/v2.0 treatment (full-bleed photo + dark scrim, Stage 4's tuned
 * contrast) is superseded, not reused — the photo is now a background layer
 * at reduced opacity, sitting *under* the section's own surface colour, so
 * the composite is dominated by the solid NeoCare surface tint rather than
 * by whatever the photo happens to contain. That's a deliberately safer
 * construction than "dark scrim over a bright photo": text contrast holds
 * almost regardless of the image, rather than depending on retuned scrim
 * stops. Still sample real rendered pixels once built (§5.1a: ≥4.5:1) —
 * "should be fine by construction" isn't "measured."
 *
 * <picture>, not next/image: mobile/desktop are different crops (art
 * direction), and this stays true even demoted to a background layer.
 */
export function Hero({ t }: { t: Dictionary }) {
  return (
    <section
      aria-labelledby="hero-heading"
      /* BUILD_SPEC v3.0 §5.2 item 1 — the header is 96px at every width now,
         so the hero's negative top margin is one value instead of two. */
      className="relative isolate -mt-24 overflow-hidden bg-surface-brand"
    >
      <picture>
        <source
          media="(min-width: 768px)"
          type="image/avif"
          srcSet="/hero/hero-desktop.avif"
        />
        <source
          media="(min-width: 768px)"
          type="image/webp"
          srcSet="/hero/hero-desktop.webp"
        />
        <source type="image/avif" srcSet="/hero/hero-mobile.avif" />
        <img
          src="/hero/hero-mobile.webp"
          alt=""
          aria-hidden="true"
          width={828}
          height={1484}
          decoding="async"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-center opacity-45 md:object-bottom"
        />
      </picture>

      <div className="mx-auto max-w-(--container-content) px-4 pb-16 pt-28 md:px-6 md:pb-24 md:pt-32">
        <div className="max-w-xl">
          <h1
            id="hero-heading"
            className="type-display measure font-semibold text-fg"
          >
            {t.hero.headline}
          </h1>
          <p className="type-body-lg measure mt-4 text-fg-muted">
            {t.hero.sub}
          </p>
          <div className="mt-8">
            <Button href="#sizes">{t.hero.cta}</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Button } from '@/components/ui/Button';
import type { Dictionary } from '@/lib/i18n';

/**
 * S1 — full-bleed hero.
 *
 * <picture> rather than next/image: the mobile and desktop crops are different
 * images (art direction, not a resize), and two <Image> elements toggled with
 * CSS would download both. The sources are pre-encoded to AVIF + WebP by
 * scripts/build-assets.mjs and already sit under the §9 180 KB hero budget
 * (mobile WebP 41.9 KB, desktop 72.3 KB).
 *
 * Stage 2 is static: no scale, no parallax. Those are Stage 3, desktop only.
 */
export function Hero({ t }: { t: Dictionary }) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate -mt-16 min-h-[100svh] md:-mt-20"
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
          alt={t.hero.imageAlt}
          width={828}
          height={1484}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-center md:object-bottom"
        />
      </picture>

      {/* Scrim for headline contrast (§5 S1).
       *
       * The spec's gradient is `linear-gradient(180deg, rgb(0 0 0/.35),
       * transparent 60%)` — which darkens the TOP. This hero is a light cream
       * blanket and the copy is bottom-anchored, so that gradient left the
       * headline at 1.24:1 and the subhead at 1.08:1 against the actual image.
       * Both fail AA badly; white text was effectively invisible.
       *
       * §5 S1 makes the measured ratio the requirement and the gradient the
       * means, so the top stop is kept (it carries the transparent header) and
       * a bottom stop is added over the copy. Stops below are tuned against
       * sampled pixels, not guessed — see the Stage 4 contrast check. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(0_0_0/.35)_0%,rgb(0_0_0/.05)_30%,rgb(0_0_0/.42)_48%,rgb(0_0_0/.55)_62%,rgb(0_0_0/.72)_100%)]"
      />

      <div className="mx-auto flex min-h-[100svh] max-w-(--container-content) flex-col justify-end px-4 pb-16 pt-28 md:px-6 md:pb-24">
        <h1
          id="hero-heading"
          className="type-display measure font-semibold text-fg-inverse drop-shadow-[0_1px_12px_rgb(0_0_0/.45)]">
          {t.hero.headline}
        </h1>
        <p className="type-body-lg measure mt-4 text-fg-inverse drop-shadow-[0_1px_10px_rgb(0_0_0/.5)]">
          {t.hero.sub}
        </p>
        <div className="mt-8">
          <Button href="#sizes">{t.hero.cta}</Button>
        </div>
      </div>
    </section>
  );
}

'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import { FeatureArrow, type ArrowHandle } from '@/components/product/FeatureArrow';
import { Reveal } from '@/components/ui/Reveal';
import type { Dictionary } from '@/lib/i18n';
import {
  FEATURE_ANCHORS,
  FEATURE_IN_VH,
  FEATURE_OUT_AT_VH,
  SEQUENCE,
} from '@/lib/sequence';
import { useCanAnimate } from '@/lib/useCanAnimate';

export const FEATURE_KEYS = ['sap', 'cuff', 'ear', 'velcro', 'backsheet'] as const;
export type FeatureKey = (typeof FEATURE_KEYS)[number];

/**
 * Normalized (0-1) scroll-trigger progress for the middle of each feature's
 * hold window, plus the very start and end of the whole sequence. Passed to
 * ScrollTrigger's `snap` so that whenever a scroll gesture stops, the pin
 * settles on one fully-visible feature instead of wherever the gesture
 * happened to leave off — which, on a fast wheel/trackpad flick, could
 * otherwise be mid-fade or straddling two callouts.
 */
const SNAP_POINTS = [
  0,
  ...FEATURE_KEYS.map((_, i) => {
    const start = SEQUENCE.revealVh + i * SEQUENCE.featureVh;
    const holdMid = start + (FEATURE_IN_VH + FEATURE_OUT_AT_VH) / 2;
    return holdMid / SEQUENCE.totalVh;
  }),
  1,
];

/**
 * Exactly one system may own opacity/transform on a given element.
 *
 * On mobile that is Reveal (IntersectionObserver). On the pinned desktop path
 * it is the GSAP timeline — so Reveal must get out of the way entirely, or its
 * opacity:0 would hold content invisible underneath GSAP's own tween.
 */
function Enter({
  animated,
  delayMs,
  className,
  children,
}: {
  animated: boolean;
  delayMs?: number;
  className?: string;
  children: React.ReactNode;
}) {
  if (animated) return <div className={className}>{children}</div>;
  return (
    <Reveal className={className} delayMs={delayMs}>
      {children}
    </Reveal>
  );
}

/**
 * S3–S8. ONE ScrollTrigger, ONE pin, ONE timeline with labels (§5).
 *
 * Below 768px — and under every §6 guard — this renders exactly the Stage 2
 * layout: a static product image, then five stacked cards. `data-pinned` never
 * becomes true, so none of the desktop CSS in globals.css applies and no GSAP
 * is created. The mobile path is not a fallback bolted on afterwards; it is
 * what the component renders by default.
 */
export function ProductSequence({ t }: { t: Dictionary }) {
  const canAnimate = useCanAnimate();

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const copyRefs = useRef<(HTMLLIElement | null)[]>([]);
  const arrowRef = useRef<ArrowHandle>(null);

  useEffect(() => {
    if (!canAnimate) return;
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    // Loaded only once the §6 guards have passed, so the ~50 KB gzipped motion
    // runtime never reaches the users those guards exist to protect.
    let disposed = false;
    let teardown: (() => void) | null = null;

    import('@/lib/motion').then(({ getGsap, startLenis }) => {
      if (disposed) return;

      const { gsap, ScrollTrigger } = getGsap();
      // §6 — desktop only, lerp 0.1. useCanAnimate already excludes <768px.
      const stopLenis = startLenis(true);

      const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          // SEQUENCE.totalVh, resolved in pixels so it does not depend on how
          // GSAP interprets a percentage for `end`.
          end: () => `+=${window.innerHeight * (SEQUENCE.totalVh / 100)}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          // Lands the pin on one fully-held feature after any scroll gesture
          // — see the SNAP_POINTS comment above.
          snap: {
            snapTo: SNAP_POINTS,
            duration: { min: 0.2, max: 0.6 },
            ease: 'power1.inOut',
          },
        },
      });

      /* ---- reveal: 0 -> 150vh ---------------------------------------- */
      tl.addLabel('reveal', 0);
      tl.fromTo(
        stage,
        { scale: 0.4, opacity: 0 },
        { scale: 1, opacity: 1, duration: SEQUENCE.revealVh, ease: 'none' },
        0,
      );

      /* ---- the five callouts, 70vh each ------------------------------ */
      FEATURE_KEYS.forEach((key, i) => {
        const start = SEQUENCE.revealVh + i * SEQUENCE.featureVh;
        const el = copyRefs.current[i];
        if (!el) return;

        tl.addLabel(key, start);

        // Copy slides in +32px.
        tl.fromTo(
          el,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: FEATURE_IN_VH, ease: 'power2.out' },
          start,
        );

        // Arrow draw. This tween owns ONLY the draw amount — the endpoint is
        // derived from timeline position in the onUpdate below. Setting the
        // target here instead would make it depend on tween render order, and
        // fromTo renders immediately on creation, so the last one built would
        // win and the arrow would point at a stale anchor.
        const draw = { v: 0 };
        tl.fromTo(
          draw,
          { v: 0 },
          {
            v: 1,
            duration: FEATURE_IN_VH * 1.5,
            ease: 'none',
            immediateRender: false,
            onUpdate: () => arrowRef.current?.setProgress(draw.v),
          },
          start,
        );

        // Previous copy out; arrow retracts before the next one retargets.
        tl.to(
          el,
          { opacity: 0, y: -16, duration: FEATURE_IN_VH, ease: 'power2.in' },
          start + FEATURE_OUT_AT_VH,
        );
        tl.to(
          draw,
          {
            v: 0,
            duration: FEATURE_IN_VH,
            ease: 'none',
            onUpdate: () => arrowRef.current?.setProgress(draw.v),
          },
          start + FEATURE_OUT_AT_VH,
        );
      });

      /* ---- arrow endpoint, derived not tweened ------------------------
       * Which anchor the arrow points at is a function of where the playhead
       * is, nothing else. Computing it here makes it correct when scrubbing
       * in either direction and independent of tween render order.
       *
       * §5.2: these percentages target /product/diaper-3d.gif, which loops on
       * its own — see the FEATURE_ANCHORS comment in lib/sequence.ts. */
      tl.eventCallback('onUpdate', () => {
        const idx = Math.floor(
          (tl.time() - SEQUENCE.revealVh) / SEQUENCE.featureVh,
        );
        const key = FEATURE_KEYS[idx];
        if (!key) return;
        const anchor = FEATURE_ANCHORS[key];
        arrowRef.current?.setTarget(anchor.x, anchor.y);
      });

      /* ---- release: 500 -> 550vh ------------------------------------- */
      const releaseAt =
        SEQUENCE.revealVh + FEATURE_KEYS.length * SEQUENCE.featureVh;
      tl.addLabel('release', releaseAt);
      tl.to(
        stage,
        { scale: 0.85, duration: SEQUENCE.releaseVh, ease: 'none' },
        releaseAt,
        );
      }, root);

      // Functional start/end are evaluated only during a refresh. Without an
      // explicit one the trigger can sit at end === null with a pin distance
      // of zero — the pin silently does nothing. A single rAF is too early:
      // the data-pinned CSS (height:100vh) is not applied yet at that point.
      //
      // Refresh once layout has settled, again when fonts swap (Hind Siliguri
      // changes section heights), and again on load once images resolve.
      const refresh = () => ScrollTrigger.refresh();
      const settle = setTimeout(refresh, 0);
      document.fonts?.ready.then(refresh).catch(() => {});
      window.addEventListener('load', refresh);

      teardown = () => {
        clearTimeout(settle);
        window.removeEventListener('load', refresh);
        // ctx.revert() kills the timeline, its ScrollTrigger and the
        // pin-spacer. Do not refresh here: it races the next mount.
        ctx.revert();
        stopLenis();
      };
    });

    return () => {
      disposed = true;
      teardown?.();
    };
  }, [canAnimate]);

  return (
    <div
      ref={rootRef}
      id="product-sequence"
      className="seq-root"
      data-pinned={canAnimate ? 'true' : 'false'}
    >
      {/* S3 — product stage */}
      <section
        aria-labelledby="product-heading"
        className="seq-stage section-rhythm bg-surface"
      >
        <div className="seq-heading mx-auto max-w-(--container-content) px-4 md:px-6">
          <Enter animated={canAnimate}>
            <h2 id="product-heading" className="type-h1 measure text-fg">
              {t.product.title}
            </h2>
            <p className="type-body-lg measure mt-4 text-fg-muted">
              {t.product.intro}
            </p>
          </Enter>
        </div>

        <div className="seq-stage-wrap mx-auto mt-10 max-w-(--container-content) px-4 md:mt-0 md:px-6">
          <Enter animated={canAnimate} className="w-full">
            <div
              ref={stageRef}
              className="seq-stage-inner relative mx-auto aspect-[1200/1698] w-full max-w-sm"
            >
              {/* Plain <img>, not next/image: it's an animated GIF and Next's
                  optimizer flattens animated GIFs to their first frame unless
                  told not to touch them at all. The loop is the rotation.

                  <picture> gates the GIF to >=768px. Measured, the GIF is
                  339 KB over the wire and it was being fetched on mobile,
                  where it accounted for 48% of the entire homepage payload —
                  on the mid-tier-Android-on-mobile-data profile the whole
                  spec is built around, and for motion that the rebuild plan
                  §5 puts on desktop only. Below 768px the browser takes the
                  14 KB still instead and never requests the GIF: <source>
                  media matching happens before the fetch, so this is a real
                  saving rather than a hidden element.

                  This is also the same breakpoint the pin itself is gated on
                  (globals.css .seq-root[data-pinned]), so the moving asset and
                  the scrubbed layout appear together or not at all. */}
              <picture>
                <source
                  media="(min-width: 768px)"
                  srcSet="/product/diaper-3d.gif"
                />
                <img
                  src="/product/hero-frame-720.webp"
                  alt={t.product.imageAlt}
                  width={1200}
                  height={1698}
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </picture>
              {/* Desktop only — there is no arrow on mobile (DESIGN.md §6). */}
              {canAnimate && <FeatureArrow ref={arrowRef} />}
            </div>
          </Enter>
        </div>
      </section>

      {/* S4–S8 — copy. Always in the DOM, at every breakpoint (§8). */}
      <section
        id="features"
        aria-labelledby="features-heading"
        className="seq-features section-rhythm bg-surface-alt"
      >
        <div className="seq-copy-wrap mx-auto max-w-(--container-content) px-4 md:px-6">
          <h2 id="features-heading" className="sr-only">
            {t.product.featuresTitle}
          </h2>

          <ul className="seq-copy-list flex flex-col gap-4">
            {FEATURE_KEYS.map((key, i) => {
              const f = t.features[key];
              return (
                <li
                  key={key}
                  className="seq-copy"
                  ref={(el) => {
                    copyRefs.current[i] = el;
                  }}
                >
                  <Enter animated={canAnimate} delayMs={i * 40}>
                    <article className="seq-card hover-card overflow-hidden rounded-card border border-hairline bg-surface shadow-card">
                      <div className="seq-card-media hover-zoom">
                        <Image
                          src={`/product/features/${key}.webp`}
                          alt={f.imageAlt}
                          width={720}
                          height={560}
                          sizes="(min-width: 768px) 560px, 92vw"
                          loading="lazy"
                          className="aspect-[2/1] w-full object-cover"
                        />
                      </div>
                      <div className="seq-card-body p-5">
                        <h3 className="type-h2 text-fg">{f.title}</h3>
                        <p className="type-body measure mt-3 text-fg-muted">
                          {f.body}
                        </p>
                      </div>
                    </article>
                  </Enter>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}

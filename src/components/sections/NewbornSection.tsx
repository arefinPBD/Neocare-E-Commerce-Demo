'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { Reveal } from '@/components/ui/Reveal';
import type { Dictionary } from '@/lib/i18n';

/**
 * S9 — New Born. Hard visual break from S3–S8 (§5 S9): different background
 * (--color-bg-brand-soft vs the cream of S4–S8), a rule across the top, a
 * distinct heading and an explicit "New Born · 0–4 kg" badge. If this reads as
 * continuous with S3–S8 it becomes a false product claim.
 *
 * Cutout image (navel_cutout_d1.jpg -> public/newborn/cutout-flatlay.webp) is
 * rendered strictly in this S9 section per build spec §1 non-negotiable 4.
 *
 * The gallery below it is an endless auto-scrolling marquee — CSS keyframe
 * animation in globals.css, gated on visibility below — holding the plain
 * navel cutout (the New Born–specific compliant shot) alongside the general
 * product photography already built into public/product: the full diaper
 * render and the five close-up crops used elsewhere in S3–S8. Reusing those
 * crops here is not a new compliance question — they already cleared the §1
 * non-negotiable-3 review for the S3–S8 sequence — it's just a second place
 * they're shown.
 */
const GALLERY: {
  src: string;
  width: number;
  height: number;
  alt: (t: Dictionary) => string;
}[] = [
    {
      src: '/newborn/cutout-flatlay.webp',
      width: 1120,
      height: 836,
      alt: (t) => t.newborn.imageAlt,
    },
    {
      /* The still frame, not diaper-3d.gif. The GIF is 339 KB over the wire
         and this marquee is the reason it was still being fetched on mobile
         after the Look Closer stage was gated to >=768px. A marquee is already
         in motion; a second, independent rotation inside one of its tiles adds
         no information for 325 KB. Same product, same framing, 38 KB. */
      src: '/product/hero-frame.webp',
      width: 1200,
      height: 1698,
      alt: (t) => t.newborn.galleryBaseAlt,
    },
    {
      src: '/product/features/sap.webp',
      width: 720,
      height: 560,
      alt: (t) => t.newborn.galleryWaistbandAlt,
    },
    {
      src: '/product/features/cuff.webp',
      width: 720,
      height: 560,
      alt: (t) => t.newborn.galleryCuffAlt,
    },
    {
      src: '/product/features/ear.webp',
      width: 720,
      height: 560,
      alt: (t) => t.newborn.gallerySideAlt,
    },
    {
      src: '/product/prints/print-01.webp',
      width: 720,
      height: 560,
      alt: (t) => t.newborn.galleryPrint1Alt,
    },
    {
      src: '/product/prints/print-02.webp',
      width: 720,
      height: 560,
      alt: (t) => t.newborn.galleryPrint2Alt,
    },
    {
      src: '/product/prints/print-03.webp',
      width: 720,
      height: 560,
      alt: (t) => t.newborn.galleryPrint3Alt,
    },
    {
      src: '/product/prints/print-04.webp',
      width: 720,
      height: 560,
      alt: (t) => t.newborn.galleryPrint4Alt,
    },
    {
      src: '/product/prints/print-05.webp',
      width: 720,
      height: 560,
      alt: (t) => t.newborn.galleryPrint5Alt,
    },
    {
      src: '/product/prints/print-06.webp',
      width: 720,
      height: 560,
      alt: (t) => t.newborn.galleryPrint6Alt,
    },
    {
      src: '/product/features/backsheet.webp',
      width: 720,
      height: 560,
      alt: (t) => t.newborn.galleryBacksheetAlt,
    },
  ];

export function NewbornSection({ t }: { t: Dictionary }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  // Duplicate gallery items once: a track holding two identical copies can
  // animate from translateX(0) to translateX(-50%) forever — the moment the
  // first copy scrolls fully out, the second (identical) copy is in exactly
  // its place, so the loop point is invisible instead of a visible jump/reset.
  const displayItems = [...GALLERY, ...GALLERY];

  // Motion starts only once the gallery is actually on screen, not the
  // instant the page loads off-screen below the fold.
  useEffect(() => {
    const node = trackRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setHasEntered(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="newborn"
      aria-labelledby="newborn-heading"
      className="section-rhythm border-t-4 border-green-700 bg-surface-brand"
    >
      <div className="mx-auto max-w-(--container-content) px-4 md:px-6">
        <Reveal>
          <p className="inline-flex items-center rounded-pill bg-green-800 px-4 py-2 type-small font-semibold text-fg-inverse">
            {t.newborn.badge}
          </p>
          <h2 id="newborn-heading" className="type-h1 measure mt-6 text-green-900">
            {t.newborn.title}
          </h2>
          <p className="type-body-lg measure mt-4 text-fg">{t.newborn.body}</p>
          <p className="type-small measure mt-3 font-semibold text-green-800">
            {t.newborn.note}
          </p>
        </Reveal>
      </div>

      {/* Full-bleed endless auto-scrolling gallery — see .marquee-track in
       * globals.css for how the two-copy track loops seamlessly. */}
      <Reveal delayMs={80} className="mt-10">
        <div className="marquee-viewport overflow-hidden px-4 md:px-6">
          <div
            ref={trackRef}
            className="marquee-track flex gap-4"
            style={{
              animationPlayState: hasEntered && !isPaused ? 'running' : 'paused',
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {displayItems.map((item, index) => (
              <div
                key={`${item.src}-${index}`}
                className="hover-zoom w-56 shrink-0 overflow-hidden rounded-card border border-hairline bg-surface shadow-card sm:w-64 md:w-72"
              >
                <Image
                  src={item.src}
                  alt={item.alt(t)}
                  width={item.width}
                  height={item.height}
                  sizes="(min-width: 768px) 288px, (min-width: 640px) 256px, 224px"
                  loading="lazy"
                  unoptimized={item.src.endsWith('.gif')}
                  className="aspect-[4/3] h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}


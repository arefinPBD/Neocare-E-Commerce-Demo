'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * BUILD_SPEC §5.3 — mobile feature cards fade in on IntersectionObserver at
 * 15% visibility. Not GSAP; this is the specified mobile behaviour.
 *
 * Every scroll effect needs a defined "off" state (§1 non-negotiable 2):
 *  - No JS      -> content renders visible. The hidden state is only ever
 *                  applied after mount, never in the server HTML.
 *  - Reduced motion -> visible immediately, observer never runs.
 *  - Observed   -> fades and rises once, then stops observing.
 *
 * Content is always in the DOM and always readable by assistive tech (§8);
 * only opacity and transform change.
 */
export function Reveal({
  children,
  className = '',
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    // Only hide what the user has not reached yet. Anything already on screen
    // at mount (or above it) is shown outright — hiding it would flash content
    // that was already painted.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setShown(true);
      return;
    }

    setArmed(true);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);

    /* Safety net. If the observer never fires — a browser that throttles it,
     * a container that never composites — the content must not stay invisible.
     * Content visible without its animation is always the better failure.
     *
     * It CHECKS VISIBILITY rather than counting down from mount, and that is
     * the whole point. As a blind 3s timer it was not a safety net at all: it
     * was the normal path. Measured on the homepage, every Look Closer card
     * faded in at ~3s after load, roughly 3000px before the section could be
     * seen, so a visitor scrolling down at human speed arrived to find
     * everything already shown and nothing ever animated. The section sits at
     * the bottom of an 859vh page; nobody reaches it inside three seconds.
     *
     * Polling is cheap (one getBoundingClientRect per second per armed
     * element, and armed elements are the minority), it cannot fire early
     * because it asks the same question the observer does, and it still
     * rescues a dead observer within a second of the element being on screen.
     */
    const failSafe = window.setInterval(() => {
      const r = el.getBoundingClientRect();
      const onScreen = r.top < window.innerHeight && r.bottom > 0;
      if (!onScreen) return;
      setShown(true);
      window.clearInterval(failSafe);
      io.disconnect();
    }, 1000);

    return () => {
      window.clearInterval(failSafe);
      io.disconnect();
    };
  }, []);

  const hidden = armed && !shown;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? 'translateY(24px)' : 'none',
        transition: armed
          ? `opacity var(--dur-slow) var(--ease-out) ${delayMs}ms, transform var(--dur-slow) var(--ease-out) ${delayMs}ms`
          : undefined,
      }}
    >
      {children}
    </div>
  );
}

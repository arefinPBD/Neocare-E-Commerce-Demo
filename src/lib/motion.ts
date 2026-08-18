'use client';

/**
 * Motion runtime — gsap, ScrollTrigger and Lenis.
 *
 * IMPORT THIS DYNAMICALLY ONLY. Together these are roughly 50 KB gzipped, and
 * the §6 guards mean they are never used below 768px, under reduced motion, on
 * save-data, or on a slow connection — which is the majority of the real
 * audience (mid-tier Android on mobile data). A static import would put all of
 * it on the critical path for exactly the users who can least afford it.
 *
 * Constants live in lib/sequence.ts so the component can read them without
 * dragging this module along.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

let registered = false;

export function getGsap() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
    if (process.env.NODE_ENV !== 'production') {
      (window as unknown as Record<string, unknown>).__ST = ScrollTrigger;
      (window as unknown as Record<string, unknown>).__gsap = gsap;
    }
  }
  return { gsap, ScrollTrigger };
}

/**
 * BUILD_SPEC §6 — Lenis is desktop only, lerp 0.1. Never on mobile: it fights
 * native scroll and breaks momentum on Android.
 *
 * Returns a teardown function.
 */
export function startLenis(enabled: boolean): () => void {
  if (!enabled) return () => {};

  const lenis = new Lenis({ lerp: 0.1 });
  const { gsap, ScrollTrigger } = getGsap();

  lenis.on('scroll', ScrollTrigger.update);

  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
  };
}

/**
 * S3–S8 sequence constants. Deliberately free of any gsap/lenis import so it
 * can be statically imported by the component without pulling the motion
 * runtime onto the critical path — see lib/motion.ts.
 */

/**
 * Timeline geometry, units in vh, summing to 750.
 *
 * featureVh was 70 (in 20 / hold 30 / out 20): a normal scroll gesture, even
 * with Lenis's lerp 0.1 smoothing, could cover more than one feature's slice
 * in a single motion, so the callout would already be fading out — or two
 * features ahead — before it had been on screen long enough to read. Widened
 * to 110 (in 20 / hold 70 / out 20) so each feature demands a deliberate
 * scroll to get through, and to leave room for the label-snap in
 * ProductSequence.tsx to settle mid-hold rather than mid-transition.
 */
export const SEQUENCE = {
  totalVh: 750,
  revealVh: 150,
  /** Each of the five callouts owns this slice: in, hold, out. */
  featureVh: 110,
  releaseVh: 50,
} as const;

export const FEATURE_IN_VH = 20;
export const FEATURE_OUT_AT_VH = 90;

/**
 * BUILD_SPEC §5.2 — endpoints are {x%, y%} against /product/diaper-3d.gif.
 *
 * THESE ARE PLACEHOLDERS, carried over from the spec's own guesses. Re-measure
 * against the real asset before sign-off (§10) — the gif's own loop means the
 * silhouette shifts slightly frame to frame, so these are an average position,
 * not a locked-frame measurement the way a scrubbed turntable would give.
 */
export const FEATURE_ANCHORS = {
  sap: { x: 50, y: 62 },
  cuff: { x: 83, y: 62 },
  ear: { x: 86, y: 30 },
  velcro: { x: 88, y: 26 },
  backsheet: { x: 34, y: 44 },
} as const;

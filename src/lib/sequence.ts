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
/**
 * BUILD_SPEC §5.6 — marker positions for the MOBILE anatomy image, as
 * percentages of `/product/hero-frame-720.webp`.
 *
 * SEPARATE FROM `FEATURE_ANCHORS` BELOW, AND THEY MUST STAY SEPARATE. These
 * are measured against the still frame; those are guesses against the rotating
 * GIF. They are two different images, so a value that is right for one is
 * wrong for the other. Do not "deduplicate" them.
 *
 * Derived, not guessed: each pair is the centre of that feature's crop window
 * in `scripts/build-assets.mjs` FEATURE_CROPS — which was measured against
 * `Diaper 34 Mockup-02.jpg` at its native 2388x2120 — mapped through the same
 * `.trim({threshold:12})` the pipeline applies, into the trimmed 1898x1476
 * frame. So a marker lands exactly where its own close-up crop was taken.
 *
 * Verified at the mobile render size (361x281): every pair is at least 67px
 * apart centre-to-centre, so five 44px tap targets fit without overlapping.
 *
 * TODO: client — markers 1 (sap) and 3 (ear) sit where their crops were taken,
 * but neither feature is literally visible there: the absorbent polymer is
 * inside the core, and the crop framed the back waistband rather than the side
 * ear. The number is a reference to the list row, not a claim that the feature
 * is visible at that pixel (§5.6). Confirm placement, or supply a cutaway.
 */
export const FEATURE_MARKERS = {
  sap: { x: 27.0, y: 43.6 },
  cuff: { x: 66.0, y: 73.4 },
  ear: { x: 37.6, y: 17.8 },
  velcro: { x: 89.7, y: 31.4 },
  backsheet: { x: 26.0, y: 67.3 },
} as const;

export const FEATURE_ANCHORS = {
  sap: { x: 50, y: 62 },
  cuff: { x: 83, y: 62 },
  ear: { x: 86, y: 30 },
  velcro: { x: 88, y: 26 },
  backsheet: { x: 34, y: 44 },
} as const;

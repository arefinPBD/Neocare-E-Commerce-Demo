@AGENTS.md

# Rules
- BUILD_SPEC.md is authoritative. DESIGN.md defines all tokens.
- Mobile (<768px) is the primary design. Desktop is enhancement.
- Never invent a performance figure, percentage, or duration.
- Navel cutout: S9 only.
- No hardcoded hex outside tokens.css.
- Bangla copy is written, not machine-translated. Client to review before launch.

# Decisions recorded during build
- **Numerals:** Western digits in both locales via `src/lib/numerals.ts`
  (`bn-BD-u-nu-latn`). Answers DESIGN.md §8. Reversible by dropping `-u-nu-latn`.
- **Size overlap:** highest band-centrality wins the primary card; every other
  matching size renders as an alternate chip. Ties break to the larger size.
  See `src/lib/sizes.ts`.
- **Excluded assets** (BUILD_SPEC §1 non-negotiable 3 — no AI image may carry a
  product claim): `INTERNAL-BRIEF__do-not-publish__sap_c1.jpg`,
  `navel_cutout_d1.jpg`, `product_angle_b1.jpg`. See `scripts/build-assets.mjs`.
- **S9 has no compliant image.** Media holds no real New Born photography.
  Section renders a marked placeholder until the client supplies one.

- **Bangla copy written (2026-08-18).** The original rule was "leave [BN] markers,
  the client writes it"; the client instead asked for Bangla as a faithful
  translation of the English. `bn.json` now carries real Bangla, zero [BN]
  markers, key parity verified (104/104). Brand and legal-entity names stay in
  Latin script (`NeoCare`, `Incepta Hygiene & Hospicare Ltd.`) to match the
  packaging; the five feature titles are transliterated for the same reason.
  Numerals stay Western per the numerals decision above. **Still needs a native
  reviewer's sign-off** — it is written Bangla, not client-approved Bangla.
- **`[TODO: client]` markers survive translation.** Every unconfirmed *fact*
  (delivery times, pack counts, minimum order, returns, payment, offline
  stockists, "trusted since" year, footer contact, DBID) is still a marker in
  both locales. Only voice-level copy carrying no unverified claim was written:
  hero headline, S12 CTA title/body, and FAQ 7 / 8 / 12.
- **FAQ 8 ("safe for newborn skin?") needs compliance sign-off.** The answer is
  descriptive only — it states no certification, test result or figure — but it
  is a safety statement on a baby-care product. Legal/compliance reads it before
  launch.

# Stages
1. Foundation — tokens, fonts, routing, content JSON. **done**
2. Mobile 375px, static, complete. No GSAP/pin/scrub/Lenis. **done**
3. Desktop >=768px enhancement. One ScrollTrigger, one pin, one timeline. **done**
4. Hardening — a11y §8, performance gates §9. **done**

# Stage 3 notes
- `lib/sequence.ts` holds sequence constants (no gsap import). `lib/motion.ts`
  holds the gsap/ScrollTrigger/Lenis runtime and is **dynamically imported
  only**, after the §6 guards pass — it is 47.9 KB gz that mobile never fetches.
- The desktop pinned layout lives in `globals.css`, gated on BOTH `min-width:
  768px` AND `[data-pinned="true"]`. The off-state is the default, not a
  fallback: if the guards fail, the stacked layout renders and no GSAP loads.
- Arrow endpoint is derived from timeline position in `tl.eventCallback
  ('onUpdate')`, never inside a tween's onUpdate — tween render order is not
  stable, and `fromTo` renders immediately on creation.
- ScrollTrigger needs an explicit `refresh()` after the timeline is built, or
  functional `end` stays null and the pin distance is zero. Refresh fires on
  settle, on `document.fonts.ready`, and on `load`.
- Dev-only URL flags (never in a production build): `?motion=force` forces the
  pinned path, `?motion=off` forces the guarded off-state for the §8
  "test with the pin disabled" check. `window.__ST` / `__gsap` exposed in dev.

Do not start a stage before the previous one is signed off.

# Stage 4 notes
- **Hero scrim retuned.** The spec's `linear-gradient(180deg, rgb(0 0 0/.35),
  transparent 60%)` darkens the TOP; the hero is a light cream blanket and the
  copy is bottom-anchored, so the headline measured 1.24:1 and the subhead
  1.08:1 against real sampled pixels. §5 S1 makes the ratio the requirement and
  the gradient the means, so stops were retuned against measured pixels.
  Now 4.6:1 / 6.39:1 mobile, 3.88:1 / 6.49:1 desktop.
- **Muted text on tinted surfaces.** DESIGN.md §1 quotes ratios against
  --nc-paper. --nc-ink-500 falls to 4.44:1 on --nc-cream and 4.32:1 on
  --nc-mint-50. globals.css steps muted text to --nc-ink-700 on those two
  surfaces only. Do not revert without re-measuring.
- Contrast is verified by sampling actual image pixels / computed styles, never
  from the token table. Re-run that check if the hero photography changes.

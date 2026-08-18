'use client';

import { useEffect, useState } from 'react';

/**
 * BUILD_SPEC §6 — motion guards.
 *
 * Returns false on the server and on first paint, so the un-animated layout is
 * always what renders before any decision is made. Nothing may depend on this
 * being true for content to be reachable.
 *
 * NOTE: saveData and effectiveType are Chromium-only — absent on Safari and
 * Firefox. They are an optimisation, not a safety net on their own.
 */
export function useCanAnimate(): boolean {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    // Dev-only escape hatch. The connection guard below is genuinely
    // unpredictable to test against — effectiveType is re-estimated as the
    // browser samples the network — so ?motion=force exercises the pinned
    // path deliberately. Never available in a production build.
    // BUILD_SPEC §8 requires testing with the pin disabled, and §10 requires
    // verifying the reduced-motion end state. Both are otherwise awkward to
    // reach on demand: effectiveType is re-estimated as the browser samples
    // the network, so the guard flips between page loads.
    //   ?motion=force -> pinned path
    //   ?motion=off   -> guarded off-state (what reduced-motion users get)
    if (process.env.NODE_ENV !== 'production') {
      const override = new URLSearchParams(window.location.search).get('motion');
      if (override === 'force') {
        setOk(true);
        return;
      }
      if (override === 'off') return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 768) return;

    const c = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;

    if (c?.saveData) return;
    if (c?.effectiveType && ['slow-2g', '2g', '3g'].includes(c.effectiveType)) {
      return;
    }

    setOk(true);
  }, []);

  return ok;
}

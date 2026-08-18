'use client';

import { useImperativeHandle, useRef, type Ref } from 'react';

export interface ArrowHandle {
  /** Endpoint in stage-percent space, matching FEATURE_ANCHORS. */
  setTarget(x: number, y: number): void;
  /** 0 = undrawn, 1 = fully drawn. */
  setProgress(p: number): void;
}

const VB = 1000;
/** Where the arrow leaves the copy column, in the same percent space. */
const ORIGIN = { x: 104, y: 50 };

/**
 * DESIGN.md §6 — SVG arrow, 1.5px --nc-green-700 stroke, animated via
 * stroke-dashoffset. Desktop only; there is no arrow on mobile.
 *
 * vector-effect="non-scaling-stroke" keeps the stroke at 1.5px regardless of
 * how the viewBox scales to the stage.
 *
 * The arrowhead sits fixed at the target and only repositions in setTarget —
 * i.e. once per feature, when scroll moves the callout to a new anchor. It
 * does not slide along the curve as the line itself draws in; only its
 * opacity tracks that draw progress, so it fades in with the line rather
 * than popping in once the stroke arrives.
 */
export function FeatureArrow({ ref }: { ref?: Ref<ArrowHandle> }) {
  const pathRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGPolygonElement>(null);
  const target = useRef({ x: ORIGIN.x, y: ORIGIN.y });

  const rebuild = () => {
    const path = pathRef.current;
    const head = headRef.current;
    if (!path) return;
    const x1 = (ORIGIN.x / 100) * VB;
    const y1 = (ORIGIN.y / 100) * VB;
    const x2 = (target.current.x / 100) * VB;
    const y2 = (target.current.y / 100) * VB;
    // Gentle curve, bowing toward the top of the stage.
    const cx = (x1 + x2) / 2;
    const cy = Math.min(y1, y2) - Math.abs(x1 - x2) * 0.18;
    path.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);

    const len = path.getTotalLength() || 1;
    path.style.strokeDasharray = String(len);
    if (path.style.strokeDashoffset === '') {
      path.style.strokeDashoffset = String(len);
    }

    // Fixed at the endpoint, rotated to the curve's tangent there (the
    // direction from the control point to x2,y2) so its tip touches the
    // target. Recomputed only here — once per new target, not per frame.
    if (head) {
      const angle = (Math.atan2(y2 - cy, x2 - cx) * 180) / Math.PI;
      head.setAttribute('transform', `translate(${x2} ${y2}) rotate(${angle})`);
    }
  };

  useImperativeHandle(ref, () => ({
    setTarget: (x: number, y: number) => {
      target.current = { x, y };
      rebuild();
    },
    setProgress: (p: number) => {
      const path = pathRef.current;
      const head = headRef.current;
      if (!path) return;
      const len = path.getTotalLength() || 1;
      const t = Math.max(0, Math.min(1, p));
      path.style.strokeDasharray = String(len);
      path.style.strokeDashoffset = String(len * (1 - t));
      // Fades in step for step with the line, so it's fully visible right as
      // the stroke finishes drawing, without moving from its fixed spot.
      if (head) head.style.opacity = String(t);
    },
  }));

  return (
    <svg
      viewBox={`0 0 ${VB} ${VB}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
    >
      <path
        ref={pathRef}
        fill="none"
        stroke="var(--nc-green-700)"
        strokeWidth="1.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <polygon
        ref={headRef}
        points="0,0 -26,-9 -26,9"
        fill="var(--nc-green-700)"
        style={{ opacity: 0 }}
      />
    </svg>
  );
}

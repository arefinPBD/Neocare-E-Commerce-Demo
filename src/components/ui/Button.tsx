import type { ComponentPropsWithoutRef } from 'react';

/* DESIGN.md §6 Button.
 * Min touch target 44x44. Padding --space-3 / --space-6, radius --radius-full.
 * Hover darkens one step, active scale(.98), focus ring from globals.css. */
const VARIANTS = {
  primary: 'bg-brand text-fg-inverse hover:bg-brand-hover',
  secondary:
    'bg-transparent text-brand border-[1.5px] border-brand hover:bg-surface-brand',
  accent: 'bg-accent-strong text-fg-inverse hover:brightness-95',
} as const;

type Variant = keyof typeof VARIANTS;

const BASE =
  'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-pill px-6 py-3 text-center font-semibold ' +
  'transition-[background-color,transform,filter] duration-[--dur-fast] ease-[--ease-out] active:scale-[.98] ' +
  'md:hover:scale-[1.03] ' +
  // Bangla runs 15-30% longer than English: never fix a button width to English.
  'w-auto max-w-full';

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ComponentPropsWithoutRef<'a'> & { variant?: Variant }) {
  return (
    <a {...props} className={`${BASE} ${VARIANTS[variant]} ${className}`} />
  );
}

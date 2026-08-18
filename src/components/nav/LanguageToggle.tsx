import Link from 'next/link';
import { LOCALE_LABEL, OTHER_LOCALE, type Locale } from '@/lib/i18n';

/* DESIGN.md §8 — always visible in the header, never auto-switched on IP.
 * The label is written in the language it switches TO, so it needs that
 * script's font even though the page is in the other language. */
export function LanguageToggle({
  current,
  label,
}: {
  current: Locale;
  label: string;
}) {
  const other = OTHER_LOCALE[current];

  return (
    <Link
      href={`/${other}`}
      lang={other}
      hrefLang={other}
      aria-label={label}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill px-3 py-2 type-small font-semibold text-brand transition-colors duration-[--dur-fast] hover:bg-surface-brand"
    >
      <span className={other === 'bn' ? 'font-bn' : 'font-en'}>
        {LOCALE_LABEL[other]}
      </span>
    </Link>
  );
}

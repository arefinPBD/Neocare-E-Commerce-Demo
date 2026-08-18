import en from '@/content/en.json';
import bn from '@/content/bn.json';

export const LOCALES = ['bn', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** BUILD_SPEC §7: bn is the default. */
export const DEFAULT_LOCALE: Locale = 'bn';

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** en.json is the source of truth for key structure; bn.json must match it. */
export type Dictionary = typeof en;

const DICTIONARIES: Record<Locale, Dictionary> = {
  en,
  bn: bn as Dictionary,
};

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export const OTHER_LOCALE: Record<Locale, Locale> = { en: 'bn', bn: 'en' };

/** Label for the language toggle, always shown in the language it switches TO. */
export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'English',
  bn: 'বাংলা',
};

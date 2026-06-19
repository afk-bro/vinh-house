// lib/content/localize.ts
import type { Locale } from '@/i18n/routing';

/** A value with a required English source and optional per-locale overrides. */
export type Localized<T> = { en: T } & Partial<Record<Locale, T>>;

/** Resolve a localized value for a locale, falling back to English. */
export function pick<T>(value: Localized<T>, locale: Locale): T {
  return value[locale] ?? value.en;
}

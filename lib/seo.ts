// lib/seo.ts — SEO URL helpers shared by metadata + sitemap.
import { routing } from '@/i18n/routing';

/**
 * URL prefix for a locale, derived from the routing config so it stays in sync
 * with `localePrefix.prefixes` (default locale is unprefixed under `as-needed`;
 * custom prefixes like zh-Hans → /zh come straight from routing).
 */
export function localePrefix(locale: string): string {
  if (locale === routing.defaultLocale) return '';
  const prefixes = (routing.localePrefix as { prefixes?: Record<string, string> }).prefixes;
  return prefixes?.[locale] ?? `/${locale}`;
}

/**
 * Canonical + hreflang alternates for a page. `path` starts with '/'
 * (or '' for the home page) and excludes the locale prefix. Returns relative
 * URLs that Next resolves against `metadataBase`.
 */
export function localeAlternates(
  locale: string,
  path = '',
): { canonical: string; languages: Record<string, string> } {
  const url = (l: string) => `${localePrefix(l)}${path}` || '/';
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = url(l);
  languages['x-default'] = url(routing.defaultLocale);
  return { canonical: url(locale), languages };
}

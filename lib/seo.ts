// lib/seo.ts — SEO URL helpers shared by metadata + sitemap.
import { routing } from '@/i18n/routing';

/** URL prefix for a locale (default locale is unprefixed; zh-Hans serves at /zh). */
export function localePrefix(locale: string): string {
  if (locale === routing.defaultLocale) return '';
  if (locale === 'zh-Hans') return '/zh';
  return `/${locale}`;
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

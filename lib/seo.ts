// lib/seo.ts — SEO URL helpers shared by metadata + sitemap.
import { routing } from '@/i18n/routing';

/**
 * Absolute site origin (no trailing slash), resolved in priority order:
 *  1. `NEXT_PUBLIC_SITE_URL` — set this for a custom/production domain.
 *  2. Vercel's platform domain (`VERCEL_PROJECT_PRODUCTION_URL`, else the per-deploy
 *     `VERCEL_URL`) — bare hostnames, so we prepend `https://`. Lets the first/preview
 *     Vercel deploy work with no env config.
 *  3. A placeholder origin for local dev/test (next.config fails a real prod build that
 *     can resolve none of the above).
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelHost) return `https://${vercelHost.replace(/\/+$/, '')}`;
  return 'https://vinh-house.example';
}

export const SITE_URL = resolveSiteUrl();

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

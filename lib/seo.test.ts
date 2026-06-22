import { describe, it, expect, vi, afterEach } from 'vitest';
import { localePrefix, localeAlternates } from './seo';

// SITE_URL is resolved at module load from env (NEXT_PUBLIC_SITE_URL, then Vercel's domain), so
// each case controls the env explicitly and re-imports the module — never relying on the ambient
// env. vitest.setup.ts clears these vars before the file loads; each test sets what it needs.
describe('SITE_URL', () => {
  const KEYS = ['NEXT_PUBLIC_SITE_URL', 'VERCEL_PROJECT_PRODUCTION_URL', 'VERCEL_URL'] as const;
  const originals = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));

  const clearAll = () => KEYS.forEach((k) => delete process.env[k]);

  afterEach(() => {
    vi.unstubAllEnvs();
    for (const k of KEYS) {
      if (originals[k] === undefined) delete process.env[k];
      else process.env[k] = originals[k];
    }
    vi.resetModules();
  });

  it('falls back to the placeholder origin (no trailing slash) when nothing is set', async () => {
    clearAll();
    vi.resetModules();
    const { SITE_URL } = await import('./seo');
    expect(SITE_URL).toBe('https://vinh-house.example');
    expect(SITE_URL.endsWith('/')).toBe(false);
  });

  it('strips a trailing slash from NEXT_PUBLIC_SITE_URL', async () => {
    clearAll();
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://vinh-house.com/');
    vi.resetModules();
    const { SITE_URL } = await import('./seo');
    expect(SITE_URL).toBe('https://vinh-house.com');
  });

  it('derives the origin from Vercel\'s production domain when NEXT_PUBLIC_SITE_URL is unset', async () => {
    clearAll();
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'vinh-house.vercel.app');
    vi.resetModules();
    const { SITE_URL } = await import('./seo');
    expect(SITE_URL).toBe('https://vinh-house.vercel.app');
  });

  it('prefers NEXT_PUBLIC_SITE_URL over the Vercel domain when both are set', async () => {
    clearAll();
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://vinh-house.com');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'vinh-house.vercel.app');
    vi.resetModules();
    const { SITE_URL } = await import('./seo');
    expect(SITE_URL).toBe('https://vinh-house.com');
  });
});

describe('localePrefix', () => {
  it('returns empty for the default locale (en is unprefixed)', () => {
    expect(localePrefix('en')).toBe('');
  });

  it('maps zh-Hans to its custom /zh prefix', () => {
    expect(localePrefix('zh-Hans')).toBe('/zh');
  });

  it('prefixes other locales with /<locale>', () => {
    expect(localePrefix('vi')).toBe('/vi');
    expect(localePrefix('ko')).toBe('/ko');
    expect(localePrefix('ru')).toBe('/ru');
  });
});

describe('localeAlternates', () => {
  it('normalizes the default-locale home to "/" and lists every language + x-default', () => {
    const { canonical, languages } = localeAlternates('en', '');
    expect(canonical).toBe('/');
    expect(languages).toEqual({
      en: '/',
      vi: '/vi',
      ko: '/ko',
      'zh-Hans': '/zh',
      ru: '/ru',
      'x-default': '/',
    });
  });

  it('builds locale-prefixed canonical + alternates for a content path', () => {
    const { canonical, languages } = localeAlternates('vi', '/buildings/gilda-hotel');
    expect(canonical).toBe('/vi/buildings/gilda-hotel');
    expect(languages.en).toBe('/buildings/gilda-hotel');
    expect(languages['zh-Hans']).toBe('/zh/buildings/gilda-hotel');
    // x-default always points at the default-locale (unprefixed) URL.
    expect(languages['x-default']).toBe('/buildings/gilda-hotel');
  });
});

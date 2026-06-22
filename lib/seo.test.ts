import { describe, it, expect, vi } from 'vitest';
import { localePrefix, localeAlternates, SITE_URL } from './seo';

describe('SITE_URL', () => {
  it('falls back to the placeholder origin (no trailing slash) when env is unset', () => {
    // NEXT_PUBLIC_SITE_URL is unset in the test env.
    expect(SITE_URL).toBe('https://vinh-house.example');
    expect(SITE_URL.endsWith('/')).toBe(false);
  });

  it('strips a trailing slash from NEXT_PUBLIC_SITE_URL', async () => {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://vinh-house.com/');
    const { SITE_URL: stripped } = await import('./seo');
    expect(stripped).toBe('https://vinh-house.com');
    vi.unstubAllEnvs();
    vi.resetModules();
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

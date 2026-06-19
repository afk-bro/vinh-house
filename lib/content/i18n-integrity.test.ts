// lib/content/i18n-integrity.test.ts
import { describe, it, expect } from 'vitest';
import { routing } from '@/i18n/routing';
import { buildings } from './site';
import { diffKeyTrees } from './i18n-validate';
import en from '../../messages/en.json';
import vi from '../../messages/vi.json';
import ko from '../../messages/ko.json';
import zhHans from '../../messages/zh-Hans.json';
import ru from '../../messages/ru.json';

const CATALOGS: Record<string, unknown> = { en, vi, ko, 'zh-Hans': zhHans, ru };

describe('i18n integrity', () => {
  it('every locale catalog matches the English key tree', () => {
    for (const locale of routing.locales) {
      const diff = diffKeyTrees(en as Record<string, unknown>, CATALOGS[locale] as Record<string, unknown>);
      if (diff.missing.length || diff.extra.length) {
        console.error(`${locale}: missing=${diff.missing.join(',')} extra=${diff.extra.join(',')}`);
      }
      expect(diff.missing, `${locale} missing keys`).toEqual([]);
      expect(diff.extra, `${locale} extra keys`).toEqual([]);
    }
  });

  it('every localized content field has an English source', () => {
    for (const b of buildings) {
      expect(b.blurb.en, `${b.slug} blurb.en`).toBeTruthy();
      expect(b.alt.en, `${b.slug} alt.en`).toBeTruthy();
      for (const r of b.rooms) {
        expect(r.name.en, `${b.slug}/${r.slug} name.en`).toBeTruthy();
        expect(r.blurb.en, `${b.slug}/${r.slug} blurb.en`).toBeTruthy();
        expect(r.alt.en, `${b.slug}/${r.slug} alt.en`).toBeTruthy();
      }
    }
  });

  it('warns (non-fatal) when a visible locale is missing content', () => {
    const visible = routing.locales.filter((l) => l !== 'en');
    for (const b of buildings) {
      for (const l of visible) {
        if (!(l in b.blurb)) console.warn(`content gap: building ${b.slug} blurb missing ${l}`);
      }
    }
    expect(true).toBe(true);
  });
});

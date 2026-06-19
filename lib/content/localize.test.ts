// lib/content/localize.test.ts
import { describe, it, expect } from 'vitest';
import { pick, type Localized } from './localize';

describe('pick', () => {
  const v: Localized<string> = { en: 'Hello', vi: 'Xin chào' };
  it('returns the requested locale when present', () => {
    expect(pick(v, 'vi')).toBe('Xin chào');
  });
  it('falls back to en when the locale is missing', () => {
    expect(pick(v, 'ko')).toBe('Hello');
    expect(pick(v, 'zh-Hans')).toBe('Hello');
  });
  it('returns en for en', () => {
    expect(pick(v, 'en')).toBe('Hello');
  });
});

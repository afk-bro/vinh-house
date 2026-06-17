// lib/content/slug.test.ts
import { describe, it, expect } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
  it('lowercases and hyphenates folder names', () => {
    expect(slugify('Gilda-Hotel')).toBe('gilda-hotel');
    expect(slugify('Azure Apartments')).toBe('azure-apartments');
  });
  it('keeps digits and collapses separators', () => {
    expect(slugify('1-bedroom')).toBe('1-bedroom');
    expect(slugify('2  Bedroom__Suite')).toBe('2-bedroom-suite');
  });
  it('strips diacritics', () => {
    expect(slugify('Đà Nẵng')).toBe('da-nang');
  });
  it('trims leading/trailing separators', () => {
    expect(slugify('--Hello--')).toBe('hello');
  });
});

// lib/content/amenities.test.ts
import { describe, it, expect } from 'vitest';
import { AMENITIES, resolveAmenities } from './amenities';

describe('amenities', () => {
  it('has 11 catalog entries, each with an English label and icon', () => {
    expect(AMENITIES).toHaveLength(11);
    for (const a of AMENITIES) {
      expect(a.id).toBeTruthy();
      expect(a.icon).toBeTruthy();
      expect(a.label.en).toBeTruthy();
    }
  });
  it('resolves selected ids in order, localized with en fallback', () => {
    const r = resolveAmenities(['wifi', 'ac'], 'vi');
    expect(r).toHaveLength(2);
    expect(r[0].icon).toBe('📶');
    expect(r[0].label).toBe('Wi-Fi miễn phí, tốc độ cao và ổn định');
    expect(r[1].label).toBe('Máy lạnh');
  });
  it('ignores unknown ids', () => {
    expect(resolveAmenities(['nope'], 'en')).toEqual([]);
  });
});

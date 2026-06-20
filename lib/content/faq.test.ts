// lib/content/faq.test.ts
import { describe, it, expect } from 'vitest';
import { FAQ, getFaq } from './faq';

describe('faq', () => {
  it('has 10 items, each with localized q and a (en required)', () => {
    expect(FAQ).toHaveLength(10);
    for (const f of FAQ) {
      expect(f.id).toBeTruthy();
      expect(f.q.en).toBeTruthy();
      expect(f.a.en).toBeTruthy();
    }
  });
  it('resolves for a locale with en fallback', () => {
    const r = getFaq('vi');
    expect(r).toHaveLength(10);
    expect(r[0].id).toBe('checkInOut');
    expect(r[0].q).toContain('nhận phòng');
  });
});

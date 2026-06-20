// lib/content/content-integrity.test.ts
import { describe, it, expect } from 'vitest';
import { buildings } from './site';
import { scanDisk, PHOTOS_BASE } from './loader';
import { validateContent } from './validate';
import { slugify } from './slug';
import { AMENITIES } from './amenities';
import { FAQ } from './faq';

describe('content integrity (real folders + site.ts)', () => {
  it('every building slug equals slugify(folder)', () => {
    for (const b of buildings) expect(b.slug).toBe(slugify(b.folder));
  });
  it('has no validation errors', () => {
    const result = validateContent(buildings, scanDisk(PHOTOS_BASE));
    if (result.errors.length) console.error('Content errors:\n' + result.errors.join('\n'));
    if (result.warnings.length) console.warn('Content warnings:\n' + result.warnings.join('\n'));
    expect(result.errors).toEqual([]);
  });
  it('every amenity label, landmark name, and FAQ q/a has an English source', () => {
    for (const a of AMENITIES) expect(a.label.en, `amenity ${a.id}`).toBeTruthy();
    for (const f of FAQ) {
      expect(f.q.en, `faq ${f.id} q`).toBeTruthy();
      expect(f.a.en, `faq ${f.id} a`).toBeTruthy();
    }
    for (const b of buildings) {
      for (const l of b.landmarks ?? []) expect(l.name.en, `${b.slug} landmark`).toBeTruthy();
    }
  });
});

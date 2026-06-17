// lib/content/validate.test.ts
import { describe, it, expect } from 'vitest';
import { validateContent } from './validate';
import type { BuildingMeta } from './types';
import type { DiskBuilding } from './loader';

function building(over: Partial<BuildingMeta> = {}): BuildingMeta {
  return {
    slug: 'gilda-hotel', folder: 'Gilda-Hotel', name: 'Gilda Hotel', address: 'x',
    googleMapsUrl: 'https://maps', blurb: 'b', alt: 'a', sortOrder: 1,
    rooms: [{ slug: '1-bedroom', name: '1 Bedroom', price: '$1', blurb: 'b', status: 'available', alt: 'a' }],
    ...over,
  };
}
const okDisk: DiskBuilding[] = [
  { folder: 'Gilda-Hotel', hasCover: true, rooms: [{ folder: '1-bedroom', hasCover: true }] },
];

describe('validateContent', () => {
  it('passes for matching metadata and disk', () => {
    expect(validateContent([building()], okDisk).errors).toEqual([]);
  });
  it('errors when a disk folder has no metadata', () => {
    const r = validateContent([], okDisk);
    expect(r.errors.some((e) => e.includes('Gilda-Hotel') && e.includes('no metadata'))).toBe(true);
  });
  it('errors when metadata has no disk folder', () => {
    const r = validateContent([building()], []);
    expect(r.errors.some((e) => e.includes('no folder'))).toBe(true);
  });
  it('errors on duplicate building slugs', () => {
    const disk: DiskBuilding[] = [
      ...okDisk,
      { folder: 'Gilda Hotel', hasCover: true, rooms: [] },
    ];
    const r = validateContent(
      [building(), building({ folder: 'Gilda Hotel', rooms: [] })],
      disk,
    );
    expect(r.errors.some((e) => e.includes('Duplicate'))).toBe(true);
  });
  it('errors when a building cover.jpg is missing', () => {
    const disk: DiskBuilding[] = [{ folder: 'Gilda-Hotel', hasCover: false, rooms: [{ folder: '1-bedroom', hasCover: true }] }];
    const r = validateContent([building()], disk);
    expect(r.errors.some((e) => e.includes('cover.jpg'))).toBe(true);
  });
  it('errors when a comingSoon building has room folders', () => {
    const r = validateContent([building({ comingSoon: true, rooms: [] })], okDisk);
    expect(r.errors.some((e) => e.includes('coming soon') || e.includes('comingSoon'))).toBe(true);
  });
  it('warns on placeholder price', () => {
    const r = validateContent(
      [building({ rooms: [{ slug: '1-bedroom', name: '1 Bedroom', price: '$— / month', blurb: 'b', status: 'available', alt: 'a' }] })],
      okDisk,
    );
    expect(r.warnings.some((w) => w.includes('placeholder'))).toBe(true);
  });
});

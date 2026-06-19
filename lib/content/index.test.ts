// lib/content/index.test.ts
import { describe, it, expect } from 'vitest';
import { resolveBuilding } from './index';
import type { BuildingMeta } from './types';

const meta: BuildingMeta = {
  slug: 'gilda-hotel', folder: 'Gilda-Hotel', name: 'Gilda Hotel', address: 'x',
  googleMapsUrl: 'https://m', blurb: { en: 'B', vi: 'B-vi' }, alt: { en: 'A building' }, sortOrder: 1,
  rooms: [{ slug: '1-bedroom', name: { en: '1 Bedroom', vi: '1 Phòng ngủ' }, price: '$1', blurb: { en: 'b' }, status: 'available', alt: { en: 'A room' } }],
};

describe('resolveBuilding', () => {
  it('resolves localized fields for the locale (with en fallback) and maps images', () => {
    const r = resolveBuilding(meta, 'vi', {
      'Gilda-Hotel': ['cover.jpg', 'building-01.jpg'],
      'Gilda-Hotel/1-bedroom': ['cover.jpg', 'room-01.jpg'],
    });
    expect(r.blurb).toBe('B-vi');                 // vi present
    expect(r.alt).toBe('A building');             // vi missing -> en
    expect(r.cover).toEqual({ src: '/Phap_photos/Gilda-Hotel/cover.jpg', alt: 'A building' });
    expect(r.resolvedRooms[0].name).toBe('1 Phòng ngủ');
    expect(r.resolvedRooms[0].images[1].alt).toBe('A room');
  });
});

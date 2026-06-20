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

import { resolveBuilding as rb } from './index';

describe('resolveBuilding info sections', () => {
  it('resolves amenities, landmarks, and map URLs for the locale', () => {
    const meta = {
      slug: 'gilda-hotel', folder: 'Gilda-Hotel', name: 'Gilda Hotel', address: 'A',
      googleMapsUrl: 'https://maps/explicit', blurb: { en: 'b' }, alt: { en: 'a' }, sortOrder: 1,
      amenityIds: ['wifi'], landmarks: [{ name: { en: 'Beach', vi: 'Bãi biển' }, distance: '0.4 km' }],
      rooms: [],
    };
    const r = rb(meta as never, 'vi', {});
    expect(r.amenities[0].icon).toBe('📶');
    expect(r.landmarks[0]).toEqual({ name: 'Bãi biển', distance: '0.4 km' });
    expect(r.mapsUrl).toBe('https://maps/explicit');
    expect(r.embedUrl).toContain('output=embed');
  });
});

// lib/content/index.test.ts
import { describe, it, expect } from 'vitest';
import { resolveBuilding } from './index';
import type { BuildingMeta } from './types';

const meta: BuildingMeta = {
  slug: 'gilda-hotel', folder: 'Gilda-Hotel', name: 'Gilda Hotel', address: 'x',
  googleMapsUrl: 'https://m', blurb: 'b', alt: 'A building', sortOrder: 1,
  rooms: [{ slug: '1-bedroom', name: '1 Bedroom', price: '$1', blurb: 'b', status: 'available', alt: 'A room' }],
};

describe('resolveBuilding', () => {
  it('maps disk image filenames to public URLs with alt defaults', () => {
    const r = resolveBuilding(meta, {
      'Gilda-Hotel': ['cover.jpg', 'building-01.jpg'],
      'Gilda-Hotel/1-bedroom': ['cover.jpg', 'room-01.jpg'],
    });
    expect(r.cover).toEqual({ src: '/Phap_photos/Gilda-Hotel/cover.jpg', alt: 'A building' });
    expect(r.images.map((i) => i.src)).toEqual([
      '/Phap_photos/Gilda-Hotel/cover.jpg',
      '/Phap_photos/Gilda-Hotel/building-01.jpg',
    ]);
    expect(r.rooms[0].cover.src).toBe('/Phap_photos/Gilda-Hotel/1-bedroom/cover.jpg');
    expect(r.rooms[0].images[1].alt).toBe('A room');
  });
});

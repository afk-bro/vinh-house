// lib/content/maps.test.ts
import { describe, it, expect } from 'vitest';
import { mapsUrl, embedUrl, directionsUrl, type MapTarget } from './maps';

const base: MapTarget = { address: '89 Cao Bá Quát, An Hải, Đà Nẵng', googleMapsUrl: '', googleMapsEmbedUrl: undefined, directionsUrl: undefined };

describe('map helpers', () => {
  it('falls back to address-derived URLs when no overrides', () => {
    const t: MapTarget = { ...base, googleMapsUrl: '' };
    expect(embedUrl(t)).toBe('https://www.google.com/maps?q=89%20Cao%20B%C3%A1%20Qu%C3%A1t%2C%20An%20H%E1%BA%A3i%2C%20%C4%90%C3%A0%20N%E1%BA%B5ng&output=embed');
    expect(directionsUrl(t)).toBe('https://www.google.com/maps/dir/?api=1&destination=89%20Cao%20B%C3%A1%20Qu%C3%A1t%2C%20An%20H%E1%BA%A3i%2C%20%C4%90%C3%A0%20N%E1%BA%B5ng');
    expect(mapsUrl(t)).toBe('https://www.google.com/maps?q=89%20Cao%20B%C3%A1%20Qu%C3%A1t%2C%20An%20H%E1%BA%A3i%2C%20%C4%90%C3%A0%20N%E1%BA%B5ng');
  });
  it('prefers explicit overrides when present', () => {
    const t: MapTarget = { address: 'x', googleMapsUrl: 'https://maps.app.goo.gl/A', googleMapsEmbedUrl: 'https://maps.example/embed', directionsUrl: 'https://maps.example/dir' };
    expect(mapsUrl(t)).toBe('https://maps.app.goo.gl/A');
    expect(embedUrl(t)).toBe('https://maps.example/embed');
    expect(directionsUrl(t)).toBe('https://maps.example/dir');
  });
});

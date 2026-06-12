import { describe, it, expect } from 'vitest';
import { listingPhotoKey } from './storage-utils';

const OWNER = '11111111-2222-3333-4444-555555555555';
// Structural shape: <kind>/<ownerId>/<uuid>.<ext> with exactly two slashes.
const SHAPE = /^(rooms|buildings)\/[0-9a-f-]+\/[0-9a-f-]+\.[a-z0-9]+$/i;

describe('listingPhotoKey', () => {
  it('returns the expected rooms/<ownerId>/<uuid>.jpg shape', () => {
    const key = listingPhotoKey('rooms', OWNER, 'jpg');
    expect(key).toMatch(SHAPE);
    expect(key.startsWith(`rooms/${OWNER}/`)).toBe(true);
    expect(key.endsWith('.jpg')).toBe(true);
  });

  it('supports buildings as the kind', () => {
    const key = listingPhotoKey('buildings', OWNER, 'png');
    expect(key).toMatch(SHAPE);
    expect(key.startsWith(`buildings/${OWNER}/`)).toBe(true);
    expect(key.endsWith('.png')).toBe(true);
  });

  it('sanitizes a hostile ext containing path traversal (slashes)', () => {
    const key = listingPhotoKey('rooms', OWNER, 'jpg/../../evil');
    expect(key).toMatch(SHAPE);
    // No path traversal survives: only the two structural slashes, no '..'.
    expect(key.split('/').length).toBe(3);
    expect(key.includes('..')).toBe(false);
  });

  it('sanitizes a hostile ext like "png/.."', () => {
    const key = listingPhotoKey('buildings', OWNER, 'png/..');
    expect(key).toMatch(SHAPE);
    expect(key.split('/').length).toBe(3);
    expect(key.includes('..')).toBe(false);
  });

  it('falls back to jpg for empty ext', () => {
    expect(listingPhotoKey('rooms', OWNER, '').endsWith('.jpg')).toBe(true);
  });

  it('falls back to jpg for garbage ext with no alphanumerics', () => {
    const key = listingPhotoKey('rooms', OWNER, '../.');
    expect(key).toMatch(SHAPE);
    expect(key.endsWith('.jpg')).toBe(true);
    expect(key.includes('..')).toBe(false);
  });
});

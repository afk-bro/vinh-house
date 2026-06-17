// lib/content/loader.test.ts
import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { listImages, scanDisk } from './loader';

const FIX = fileURLToPath(new URL('./__fixtures__/photos', import.meta.url));

describe('listImages', () => {
  it('returns image files with cover.jpg first, ignoring non-images', () => {
    const dir = `${FIX}/Test-Building`;
    expect(listImages(dir)).toEqual(['cover.jpg', 'building-01.jpg']);
  });
  it('returns [] for a folder with no images', () => {
    expect(listImages(`${FIX}/Empty-Building`)).toEqual([]);
  });
});

describe('scanDisk', () => {
  it('reports building folders, room subfolders, and cover presence', () => {
    const disk = scanDisk(FIX);
    const tb = disk.find((b) => b.folder === 'Test-Building')!;
    expect(tb.hasCover).toBe(true);
    expect(tb.rooms).toEqual([{ folder: '1-bedroom', hasCover: true }]);
    const eb = disk.find((b) => b.folder === 'Empty-Building')!;
    expect(eb.hasCover).toBe(false);
    expect(eb.rooms).toEqual([]);
  });
});

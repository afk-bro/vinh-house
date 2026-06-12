import { describe, it, expect } from 'vitest';
import { getCover, setCover, addPhoto, removePhoto, reorder } from './photos';

const P = (url: string, is_cover = false) => ({ url, alt: '', is_cover });

describe('photos helpers', () => {
  it('first added photo is the cover', () => {
    expect(addPhoto([], 'a.jpg')[0].is_cover).toBe(true);
  });
  it('getCover prefers the flagged photo, falls back to first', () => {
    expect(getCover([P('a'), P('b', true)])?.url).toBe('b');
    expect(getCover([P('a'), P('b')])?.url).toBe('a');
    expect(getCover([])).toBeUndefined();
  });
  it('setCover flags exactly one', () => {
    const r = setCover([P('a', true), P('b')], 'b');
    expect(r.filter((p) => p.is_cover).map((p) => p.url)).toEqual(['b']);
  });
  it('removing the cover promotes the new first', () => {
    expect(removePhoto([P('a', true), P('b')], 'a')[0].is_cover).toBe(true);
  });
  it('removePhoto does not mutate the original input objects', () => {
    const input = [P('a', true), P('b')];
    const originalFirst = input[1];
    removePhoto(input, 'a');
    expect(originalFirst.is_cover).toBe(false);
  });
  it('reorder with an out-of-range from index returns an equal copy', () => {
    const input = [P('a'), P('b')];
    const result = reorder(input, 5, 0);
    expect(result).not.toBe(input);
    expect(result).toEqual(input);
  });
});

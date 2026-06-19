// lib/content/i18n-validate.test.ts
import { describe, it, expect } from 'vitest';
import { diffKeyTrees, flattenKeys } from './i18n-validate';

describe('flattenKeys', () => {
  it('flattens nested object keys with dot paths', () => {
    expect(flattenKeys({ a: { b: 1, c: 2 }, d: 3 }).sort()).toEqual(['a.b', 'a.c', 'd']);
  });
});

describe('diffKeyTrees', () => {
  const base = { a: { b: 1 }, c: 2 };
  it('reports missing and extra keys vs the base', () => {
    const r = diffKeyTrees(base, { a: {}, c: 2, e: 9 });
    expect(r.missing).toEqual(['a.b']);
    expect(r.extra).toEqual(['e']);
  });
  it('reports nothing for an identical tree', () => {
    const r = diffKeyTrees(base, { a: { b: 5 }, c: 7 });
    expect(r.missing).toEqual([]);
    expect(r.extra).toEqual([]);
  });
});

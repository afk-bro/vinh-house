// lib/content/i18n-validate.ts
type Tree = Record<string, unknown>;

/** Flatten nested message object into dot-path leaf keys. */
export function flattenKeys(obj: Tree, prefix = ''): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...flattenKeys(v as Tree, path));
    else out.push(path);
  }
  return out;
}

/** Keys missing from / extra in `candidate` relative to `base`. */
export function diffKeyTrees(base: Tree, candidate: Tree): { missing: string[]; extra: string[] } {
  const b = new Set(flattenKeys(base));
  const c = new Set(flattenKeys(candidate));
  return {
    missing: [...b].filter((k) => !c.has(k)).sort(),
    extra: [...c].filter((k) => !b.has(k)).sort(),
  };
}

'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { t } from '@/lib/content/strings';

type Item = { slug: string; name: string; comingSoon: boolean };

export default function BuildingsMenu({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-elevated"
      >
        {t.nav.buildings} ▾
      </button>
      {open && (
        <div role="menu" className="absolute left-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-surface-card shadow-2xl">
          {items.map((b) => (
            <Link
              key={b.slug}
              role="menuitem"
              href={`/buildings/${b.slug}`}
              className="flex items-center justify-between px-4 py-2.5 text-sm text-text-primary hover:bg-surface-elevated"
              onClick={() => setOpen(false)}
            >
              {b.name}
              {b.comingSoon && <span className="text-xs italic text-text-muted">{t.nav.comingSoon}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

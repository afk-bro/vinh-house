'use client';

import { useEffect, useRef, useState } from 'react';
import { t } from '@/lib/content/strings';

const LANGS = [
  { code: 'en', flag: '🇬🇧', name: 'English', active: true },
  { code: 'vi', flag: '🇻🇳', name: 'Tiếng Việt', active: false },
  { code: 'ko', flag: '🇰🇷', name: '한국어', active: false },
  { code: 'zh', flag: '🇨🇳', name: '中文', active: false },
  { code: 'ru', flag: '🇷🇺', name: 'Русский', active: false },
];

export default function LanguageMenu() {
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
        aria-label={t.nav.selectLanguage}
        className="rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-elevated"
      >
        EN ▾
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-surface-card shadow-2xl">
          {LANGS.map((l) => (
            <div
              key={l.code}
              role="menuitem"
              aria-disabled={!l.active}
              className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                l.active ? 'text-text-primary' : 'cursor-not-allowed text-text-muted'
              }`}
            >
              <span><span className="mr-2">{l.flag}</span>{l.name}</span>
              {!l.active && <span className="text-xs italic">{t.nav.comingSoon}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

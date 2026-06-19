'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

const NAMES: Record<Locale, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
  ko: '한국어',
  'zh-Hans': '中文',
  ru: 'Русский',
};

export default function LanguageMenu() {
  const t = useTranslations();
  const active = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function switchTo(locale: Locale) {
    setOpen(false);
    startTransition(() => router.replace(pathname, { locale }));
  }

  const shortLabel: Record<Locale, string> = { en: 'EN', vi: 'VI', ko: 'KO', 'zh-Hans': '中', ru: 'RU' };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('nav.selectLanguage')}
        disabled={isPending}
        className="rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-elevated"
      >
        {shortLabel[active]} ▾
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-surface-card shadow-2xl">
          {routing.locales.map((loc) => (
            <button
              key={loc}
              role="menuitem"
              onClick={() => switchTo(loc)}
              className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-surface-elevated ${
                loc === active ? 'font-semibold text-text-accent' : 'text-text-primary'
              }`}
            >
              {NAMES[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

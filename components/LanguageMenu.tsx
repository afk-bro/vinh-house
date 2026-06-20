'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import GB from 'country-flag-icons/react/3x2/GB';
import VN from 'country-flag-icons/react/3x2/VN';
import KR from 'country-flag-icons/react/3x2/KR';
import CN from 'country-flag-icons/react/3x2/CN';
import RU from 'country-flag-icons/react/3x2/RU';

const NAMES: Record<Locale, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
  ko: '한국어',
  'zh-Hans': '中文',
  ru: 'Русский',
};

const FLAGS: Record<Locale, typeof GB> = {
  en: GB,
  vi: VN,
  ko: KR,
  'zh-Hans': CN,
  ru: RU,
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

  const ActiveFlag = FLAGS[active];
  const flagClass = 'h-4 w-6 shrink-0 rounded-[2px] shadow-sm ring-1 ring-black/10';
  const SHORT: Record<Locale, string> = { en: 'EN', vi: 'VI', ko: 'KO', 'zh-Hans': '中', ru: 'RU' };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('nav.selectLanguage')}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-text-primary hover:bg-surface-elevated"
      >
        <ActiveFlag className={flagClass} title={NAMES[active]} />
        <span>{SHORT[active]}</span>
        <span aria-hidden>▾</span>
      </button>
      {open && (
        <div role="menu" className="menu-in absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-surface-card shadow-2xl">
          {routing.locales.map((loc) => {
            const Flag = FLAGS[loc];
            return (
              <button
                key={loc}
                type="button"
                role="menuitem"
                onClick={() => switchTo(loc)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-surface-elevated ${
                  loc === active ? 'font-semibold text-text-accent' : 'text-text-primary'
                }`}
              >
                <Flag className={flagClass} title={NAMES[loc]} />
                {NAMES[loc]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// components/MobileNav.tsx
'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { Menu, X } from 'lucide-react';
import GB from 'country-flag-icons/react/3x2/GB';
import VN from 'country-flag-icons/react/3x2/VN';
import KR from 'country-flag-icons/react/3x2/KR';
import CN from 'country-flag-icons/react/3x2/CN';
import RU from 'country-flag-icons/react/3x2/RU';

type Item = { slug: string; name: string; comingSoon: boolean };

const NAMES: Record<Locale, string> = {
  en: 'English', vi: 'Tiếng Việt', ko: '한국어', 'zh-Hans': '中文', ru: 'Русский',
};
const FLAGS: Record<Locale, typeof GB> = { en: GB, vi: VN, ko: KR, 'zh-Hans': CN, ru: RU };
const SHORT: Record<Locale, string> = { en: 'EN', vi: 'VI', ko: 'KO', 'zh-Hans': 'ZH', ru: 'RU' };

export default function MobileNav({ items, motorbikeUrl }: { items: Item[]; motorbikeUrl: string }) {
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
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  function switchTo(locale: Locale) {
    setOpen(false);
    startTransition(() => router.replace(pathname, { locale }));
  }

  const flagClass = 'h-4 w-6 shrink-0 rounded-[2px] shadow-sm ring-1 ring-black/10';

  return (
    <div className="relative md:hidden" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={t('nav.menu')}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-text-primary hover:bg-surface-elevated"
      >
        {open ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
      </button>
      {open && (
        <nav id="mobile-nav-panel" aria-label={t('nav.menu')} style={{ transformOrigin: 'top right' }} className="menu-in absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-surface-card shadow-2xl">
          <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-text-muted">{t('nav.buildings')}</p>
          {items.map((b) => (
            <Link
              key={b.slug}
              href={`/buildings/${b.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-4 py-3 text-sm text-text-primary hover:bg-surface-elevated"
            >
              {b.name}
              {b.comingSoon && <span className="text-xs italic text-text-muted">{t('nav.comingSoon')}</span>}
            </Link>
          ))}
          <a
            href={motorbikeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="block border-t border-[var(--color-border-subtle)] px-4 py-3 text-sm text-text-primary hover:bg-surface-elevated"
          >
            {t('nav.scooterRental')}
          </a>
          <div className="border-t border-[var(--color-border-subtle)] px-4 py-3">
            <p className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">{t('nav.selectLanguage')}</p>
            <div className="flex flex-wrap gap-2">
              {routing.locales.map((loc) => {
                const Flag = FLAGS[loc];
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => switchTo(loc)}
                    disabled={isPending}
                    aria-label={NAMES[loc]}
                    className={`flex min-h-[44px] items-center gap-1.5 rounded-lg border px-3 py-2 text-sm ${
                      loc === active
                        ? 'border-[var(--color-border-strong)] font-semibold text-text-accent'
                        : 'border-[var(--color-border-default)] text-text-primary'
                    } hover:bg-surface-elevated`}
                  >
                    <Flag className={flagClass} title={NAMES[loc]} />
                    {SHORT[loc]}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}

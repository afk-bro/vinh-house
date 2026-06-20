'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Contacts } from '@/lib/content/types';
import { buildInquiryLinks } from '@/lib/content/inquiry';

type Props = { contacts: Contacts; message: string; label?: string };

export default function BookNowMenu({ contacts, message, label }: Props) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const links = buildInquiryLinks(contacts, message);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const item = 'block px-4 py-2.5 text-sm text-text-primary hover:bg-surface-elevated';
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-lg bg-cta px-5 py-2.5 font-medium text-text-inverse shadow-md shadow-cta/30 transition hover:-translate-y-0.5 hover:bg-cta-hover hover:shadow-lg"
      >
        {label ?? t('nav.bookNow')}
      </button>
      {open && (
        <div role="menu" className="menu-in absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-surface-card shadow-2xl">
          {links.whatsapp && <a role="menuitem" className={item} href={links.whatsapp} target="_blank" rel="noopener noreferrer">{t('booking.whatsapp')}</a>}
          {links.phone && <a role="menuitem" className={item} href={links.phone}>{t('booking.phone')}</a>}
          {links.facebook && <a role="menuitem" className={item} href={links.facebook} target="_blank" rel="noopener noreferrer">{t('booking.facebook')}</a>}
          {links.email && <a role="menuitem" className={item} href={links.email}>{t('booking.email')}</a>}
        </div>
      )}
    </div>
  );
}

import Image from 'next/image';
import { contacts } from '@/lib/content/site';
import { whatsappUrl, telUrl, mailtoUrl } from '@/lib/contacts';
import { t } from '@/lib/content/strings';

export default function Footer() {
  const wa = whatsappUrl(contacts.whatsapp);
  const tel = telUrl(contacts.phone);
  const mail = mailtoUrl(contacts.email);
  const link = 'text-sm text-text-secondary hover:text-text-accent';
  return (
    <footer className="mt-20 border-t border-[var(--color-border-subtle)] bg-navbar-forest">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-start gap-3">
          <Image src="/logo.png" alt="Vĩnh House logo" width={44} height={44} className="rounded" />
          <div>
            <p className="font-heading text-2xl text-text-accent">{t.brand.name}</p>
            <p className="mt-1 max-w-md text-sm text-text-muted">{t.brand.footerTagline}</p>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {mail && <a className={link} href={mail}>{contacts.email}</a>}
          {tel && <a className={link} href={tel}>{contacts.phone}</a>}
          {wa && <a className={link} href={wa} target="_blank" rel="noopener noreferrer">{t.booking.whatsapp}</a>}
          {contacts.facebook && <a className={link} href={contacts.facebook} target="_blank" rel="noopener noreferrer">{t.booking.facebook}</a>}
        </nav>
      </div>
    </footer>
  );
}

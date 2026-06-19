import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import BuildingsMenu from './BuildingsMenu';
import LanguageMenu from './LanguageMenu';
import BookNowMenu from './BookNowMenu';
import { contacts, buildingNav } from '@/lib/content/site';

export default async function Navbar() {
  const t = await getTranslations();
  const generic = t('inquiry.generic');
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border-default)] bg-navbar-forest/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Vĩnh House logo" width={40} height={40} className="rounded" />
          <span className="leading-tight">
            <span className="block font-heading text-xl text-text-accent">{t('brand.name')}</span>
            <span className="block text-[11px] text-text-muted">{t('brand.subtitle')}</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <BuildingsMenu items={buildingNav()} />
          <a href={contacts.motorbikeUrl} target="_blank" rel="noopener noreferrer"
            className="hidden rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-elevated sm:block">
            {t('nav.scooterRental')}
          </a>
          <LanguageMenu />
          <BookNowMenu contacts={contacts} message={generic} />
        </div>
      </nav>
    </header>
  );
}

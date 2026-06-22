import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import BuildingsMenu from './BuildingsMenu';
import LanguageMenu from './LanguageMenu';
import BookNowButton from './BookNowButton';
import MobileNav from './MobileNav';
import { contacts, buildingNav } from '@/lib/content/site';

export default async function Navbar() {
  const t = await getTranslations();
  const items = buildingNav();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border-default)] bg-navbar-forest/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image src="/v-logo.png" alt="Vĩnh House logo" width={44} height={44} className="h-10 w-10 rounded sm:h-11 sm:w-11" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-heading text-xl text-text-accent sm:text-2xl">{t('brand.name')}</span>
            <span className="hidden truncate text-[11px] text-text-muted md:block">{t('brand.subtitle')}</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-3 md:flex">
            <BuildingsMenu items={items} />
            <a href={contacts.motorbikeUrl} target="_blank" rel="noopener noreferrer"
              className="rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-elevated">
              {t('nav.scooterRental')}
            </a>
            <LanguageMenu />
          </div>
          <BookNowButton compact />
          <MobileNav items={items} motorbikeUrl={contacts.motorbikeUrl} />
        </div>
      </nav>
    </header>
  );
}

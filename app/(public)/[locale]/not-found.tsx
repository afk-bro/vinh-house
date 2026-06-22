import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Container from '@/components/Container';

// Rendered inside the locale layout (navbar + footer) when notFound() fires on a bad
// building/room slug or an unmatched path under a locale.
export default async function LocaleNotFound() {
  const t = await getTranslations('notFound');
  return (
    <Container>
      <div className="mx-auto my-24 max-w-xl text-center">
        <p className="font-heading text-7xl text-text-accent">404</p>
        <h1 className="mt-4 font-heading text-3xl text-text-accent">{t('title')}</h1>
        <p className="mt-3 text-text-secondary">{t('body')}</p>
        <Link
          href="/"
          className="cta-pill mt-8 inline-flex bg-cta text-text-inverse shadow-md shadow-cta/30 hover:bg-cta-hover hover:shadow-lg"
        >
          {t('home')}
        </Link>
      </div>
    </Container>
  );
}

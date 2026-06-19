import Container from './Container';
import { getTranslations } from 'next-intl/server';
import { contacts } from '@/lib/content/site';

export default async function ScooterBand() {
  const t = await getTranslations('scooter');
  return (
    <section className="bg-[#E0F7F4] py-14">
      <Container>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-3xl text-[var(--color-primary-dark)]">{t('title')}</h3>
            <p className="mt-1 text-text-secondary">{t('body')}</p>
          </div>
          <a href={contacts.motorbikeUrl} target="_blank" rel="noopener noreferrer"
            className="shrink-0 rounded-lg bg-cta px-5 py-2.5 font-medium text-text-inverse shadow-md shadow-cta/30 transition hover:bg-cta-hover">
            {t('cta')}
          </a>
        </div>
      </Container>
    </section>
  );
}

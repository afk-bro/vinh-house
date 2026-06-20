import Container from './Container';
import Reveal from './Reveal';
import { getTranslations } from 'next-intl/server';
import { contacts } from '@/lib/content/site';

export default async function ScooterBand() {
  const t = await getTranslations('scooter');
  return (
    <section className="bg-gradient-to-br from-[#E3F8F4] via-[#E0F7F4] to-[#D2F0EC] py-14">
      <Container>
        <Reveal>
          <div className="flex flex-col items-center gap-5 text-center">
            <div>
              <h3 className="font-heading text-3xl text-[var(--color-primary-dark)]">{t('title')}</h3>
              <p className="mt-1 text-text-secondary">{t('body')}</p>
            </div>
            <a href={contacts.motorbikeUrl} target="_blank" rel="noopener noreferrer"
              className="cta-pill bg-cta text-text-inverse shadow-md shadow-cta/30 hover:bg-cta-hover hover:shadow-lg">
              {t('cta')}
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

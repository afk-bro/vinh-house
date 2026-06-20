import { getTranslations, setRequestLocale } from 'next-intl/server';
import Hero from '@/components/Hero';
import ValueProps from '@/components/ValueProps';
import BuildingShowcase from '@/components/BuildingShowcase';
import ScooterBand from '@/components/ScooterBand';
import Container from '@/components/Container';
import BookNowMenu from '@/components/BookNowMenu';
import Reveal from '@/components/Reveal';
import { contacts } from '@/lib/content/site';
import { whatsappUrl } from '@/lib/contacts';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const generic = t('inquiry.generic');
  const wa = whatsappUrl(contacts.whatsapp, generic);
  return (
    <>
      <Hero />
      <ValueProps />
      <BuildingShowcase />
      <ScooterBand />
      <section className="py-16">
        <Container>
          <Reveal>
            <div className="flex flex-col items-center gap-5 rounded-2xl bg-gradient-to-br from-[#FFF4DF] via-[var(--color-surface-secondary)] to-[#FBE6C4] px-6 py-14 text-center shadow-sm">
              <h2 className="max-w-2xl font-heading text-4xl text-[var(--color-primary-dark)]">{t('cta.readyToBook')}</h2>
              <p className="max-w-xl text-text-secondary">{t('cta.readyToBookBody')}</p>
              <div className="flex items-center gap-4">
                <BookNowMenu contacts={contacts} message={generic} />
                {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--color-primary)] underline-offset-4 hover:underline">{t('booking.whatsapp')}</a>}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

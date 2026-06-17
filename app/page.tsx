import Hero from '@/components/Hero';
import ValueProps from '@/components/ValueProps';
import BuildingShowcase from '@/components/BuildingShowcase';
import ScooterBand from '@/components/ScooterBand';
import Container from '@/components/Container';
import BookNowMenu from '@/components/BookNowMenu';
import { contacts } from '@/lib/content/site';
import { inquiryMessage } from '@/lib/content/inquiry';
import { whatsappUrl } from '@/lib/contacts';
import { t } from '@/lib/content/strings';

export default function Home() {
  const wa = whatsappUrl(contacts.whatsapp, inquiryMessage({}));
  return (
    <>
      <Hero />
      <ValueProps />
      <BuildingShowcase />
      <ScooterBand />
      <section className="py-16">
        <Container>
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-[var(--color-surface-secondary)] px-6 py-14 text-center">
            <h2 className="max-w-2xl font-heading text-4xl text-[var(--color-primary-dark)]">{t.cta.readyToBook}</h2>
            <p className="max-w-xl text-text-secondary">{t.cta.readyToBookBody}</p>
            <div className="flex items-center gap-4">
              <BookNowMenu contacts={contacts} message={inquiryMessage({})} />
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium text-[var(--color-primary)] hover:underline">
                  {t.booking.whatsapp}
                </a>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

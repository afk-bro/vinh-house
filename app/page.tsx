import Hero from '@/components/Hero';
import ValueProps from '@/components/ValueProps';
import BuildingShowcase from '@/components/BuildingShowcase';
import ScooterBand from '@/components/ScooterBand';
import Container from '@/components/Container';
import BookNowMenu from '@/components/BookNowMenu';
import { contacts } from '@/lib/content/site';
import { inquiryMessage } from '@/lib/content/inquiry';
import { t } from '@/lib/content/strings';

export default function Home() {
  return (
    <>
      <Hero />
      <ValueProps />
      <BuildingShowcase />
      <ScooterBand />
      <section className="py-16">
        <Container>
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="font-heading text-3xl text-text-accent">{t.cta.readyToBook}</h2>
            <p className="text-text-secondary">{t.cta.readyToBookBody}</p>
            <BookNowMenu contacts={contacts} message={inquiryMessage({})} />
          </div>
        </Container>
      </section>
    </>
  );
}

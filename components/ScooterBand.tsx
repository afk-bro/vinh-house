import Container from './Container';
import { contacts } from '@/lib/content/site';
import { t } from '@/lib/content/strings';

export default function ScooterBand() {
  return (
    <section className="bg-surface-secondary py-12">
      <Container>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-2xl text-text-accent">{t.scooter.title}</h3>
            <p className="mt-1 text-text-secondary">{t.scooter.body}</p>
          </div>
          <a
            href={contacts.motorbikeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-accent-gold px-5 py-2.5 font-medium text-text-inverse hover:brightness-105"
          >
            {t.scooter.cta}
          </a>
        </div>
      </Container>
    </section>
  );
}

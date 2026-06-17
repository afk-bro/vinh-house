import Container from './Container';
import { contacts } from '@/lib/content/site';
import { t } from '@/lib/content/strings';

export default function ScooterBand() {
  return (
    <section className="bg-[#E0F7F4] py-14">
      <Container>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-3xl text-[var(--color-primary-dark)]">{t.scooter.title}</h3>
            <p className="mt-1 text-text-secondary">{t.scooter.body}</p>
          </div>
          <a
            href={contacts.motorbikeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg bg-cta px-5 py-2.5 font-medium text-text-inverse shadow-md shadow-cta/30 transition hover:bg-cta-hover"
          >
            {t.scooter.cta}
          </a>
        </div>
      </Container>
    </section>
  );
}

import Container from './Container';
import { Wallet, MessageCircle, MapPin } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

const ENTRIES = [
  { key: 'bookDirect', Icon: Wallet },
  { key: 'message', Icon: MessageCircle },
  { key: 'local', Icon: MapPin },
] as const;

export default async function ValueProps() {
  const t = await getTranslations('valueProps');
  return (
    <section className="py-16">
      <Container>
        <div className="grid gap-10 sm:grid-cols-3">
          {ENTRIES.map(({ key, Icon }) => (
            <div key={key}>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-primary)]">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-4 font-heading text-2xl text-text-accent">{t(`${key}.title`)}</h3>
              <p className="mt-2 text-text-secondary">{t(`${key}.body`)}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

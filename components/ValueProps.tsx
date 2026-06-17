import Container from './Container';
import { Wallet, MessageCircle, MapPin } from 'lucide-react';
import { t } from '@/lib/content/strings';

const ICONS = [Wallet, MessageCircle, MapPin];

export default function ValueProps() {
  return (
    <section className="py-16">
      <Container>
        <div className="grid gap-10 sm:grid-cols-3">
          {t.valueProps.map((p, i) => {
            const Icon = ICONS[i];
            return (
              <div key={p.title}>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-primary)]">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-4 font-heading text-2xl text-text-accent">{p.title}</h3>
                <p className="mt-2 text-text-secondary">{p.body}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

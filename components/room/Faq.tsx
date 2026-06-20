// components/room/Faq.tsx
import { getTranslations } from 'next-intl/server';
import Reveal from '@/components/Reveal';
import type { ResolvedFaq } from '@/lib/content/faq';

export default async function Faq({ items }: { items: ResolvedFaq[] }) {
  if (items.length === 0) return null;
  const t = await getTranslations('roomInfo');
  return (
    <section className="mt-14">
      <Reveal>
        <h2 className="font-heading text-3xl text-text-accent">{t('faqHeading')}</h2>
        <div className="mt-6 divide-y divide-[var(--color-border-subtle)] border-y border-[var(--color-border-subtle)]">
          {items.map((f) => (
            <details key={f.id} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium text-text-primary marker:hidden [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="shrink-0 text-[var(--color-primary)] transition-transform duration-200 group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="pb-4 text-text-secondary">{f.a}</p>
            </details>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

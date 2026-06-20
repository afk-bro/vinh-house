// components/room/AroundSection.tsx
import { getTranslations } from 'next-intl/server';
import { MapPin } from 'lucide-react';
import Reveal from '@/components/Reveal';
import type { ResolvedLandmark } from '@/lib/content';

export default async function AroundSection({ landmarks }: { landmarks: ResolvedLandmark[] }) {
  if (landmarks.length === 0) return null;
  const t = await getTranslations('roomInfo');
  return (
    <section className="mt-14">
      <Reveal>
        <h2 className="font-heading text-3xl text-text-accent">{t('aroundHeading')}</h2>
        <ul className="mt-6 divide-y divide-[var(--color-border-subtle)]">
          {landmarks.map((l) => (
            <li key={l.name} className="flex items-center justify-between gap-4 py-3">
              <span className="flex items-center gap-3 text-text-primary">
                <MapPin className="h-4 w-4 shrink-0 text-[var(--color-primary)]" aria-hidden />
                {l.name}
              </span>
              <span className="shrink-0 text-sm text-text-muted">{t('approx')} {l.distance}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

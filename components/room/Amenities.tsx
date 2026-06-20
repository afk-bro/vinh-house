// components/room/Amenities.tsx
import { getTranslations } from 'next-intl/server';
import Reveal from '@/components/Reveal';
import type { ResolvedAmenity } from '@/lib/content/amenities';

export default async function Amenities({ amenities }: { amenities: ResolvedAmenity[] }) {
  if (amenities.length === 0) return null;
  const t = await getTranslations('roomInfo');
  return (
    <section className="mt-14">
      <Reveal>
        <h2 className="font-heading text-3xl text-text-accent">{t('amenitiesHeading')}</h2>
        <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {amenities.map((a) => (
            <li key={a.label} className="flex items-center gap-3 text-text-secondary">
              <span className="text-xl leading-none" aria-hidden>{a.icon}</span>
              <span>{a.label}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import Container from './Container';
import { getBuildings } from '@/lib/content';
import { t } from '@/lib/content/strings';

export default function BuildingShowcase() {
  const buildings = getBuildings();
  return (
    <section id="buildings" className="py-16">
      <Container>
        <h2 className="font-heading text-4xl text-text-accent">{t.buildings.heading}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {buildings.map((b) => (
            <Link
              key={b.slug}
              href={`/buildings/${b.slug}`}
              className="block overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-surface-card"
            >
              {b.cover && (
                <Image src={b.cover.src} alt={b.cover.alt} width={480} height={300}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="h-48 w-full object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-heading text-2xl text-text-primary">{b.name}</h3>
                <p className="text-sm text-text-muted">{b.address}</p>
                <p className="mt-2 text-sm text-text-accent">
                  {b.comingSoon
                    ? t.buildings.comingSoonShort
                    : `${b.resolvedRooms.length} ${b.resolvedRooms.length === 1 ? t.buildings.roomType : t.buildings.roomTypes}`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

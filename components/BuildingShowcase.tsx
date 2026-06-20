import Image from 'next/image';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Container from './Container';
import Reveal from './Reveal';
import { getBuildings } from '@/lib/content';
import type { Locale } from '@/i18n/routing';

export default async function BuildingShowcase() {
  const t = await getTranslations('buildings');
  const locale = (await getLocale()) as Locale;
  const buildings = getBuildings(locale);
  return (
    <section id="buildings" className="py-16">
      <Container>
        <Reveal>
          <h2 className="font-heading text-4xl text-text-accent">{t('heading')}</h2>
        </Reveal>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {buildings.map((b, i) => (
            <Reveal key={b.slug} delay={i * 70}>
              <Link href={`/buildings/${b.slug}`}
                className="group block h-full overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-surface-card shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
                {b.cover && (
                  <div className="h-48 w-full overflow-hidden">
                    <Image src={b.cover.src} alt={b.cover.alt} width={480} height={300}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="h-48 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-heading text-2xl text-text-accent">{b.name}</h3>
                  <p className="mt-1 text-sm text-text-muted">{b.address}</p>
                  {b.comingSoon ? (
                    <span className="mt-3 inline-block rounded-full bg-[var(--color-surface-secondary)] px-3 py-1 text-xs font-medium text-text-secondary">
                      {t('comingSoonShort')}
                    </span>
                  ) : (
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-text-muted">
                        {`${b.resolvedRooms.length} ${b.resolvedRooms.length === 1 ? t('roomType') : t('roomTypes')}`}
                      </span>
                      <span className="text-sm font-medium text-[var(--color-primary)] transition-transform duration-300 group-hover:translate-x-1">
                        {t('viewRooms')}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

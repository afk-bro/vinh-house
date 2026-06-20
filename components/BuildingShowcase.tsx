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
    <section id="buildings" className="scroll-mt-24 py-16">
      <Container>
        <Reveal>
          <h2 className="font-heading text-4xl text-text-accent">{t('heading')}</h2>
          <p className="mt-3 max-w-2xl text-text-secondary">{t('intro')}</p>
        </Reveal>
        <div className="mx-auto mt-8 grid max-w-5xl gap-6 sm:grid-cols-2">
          {buildings.map((b, i) => (
            <Reveal key={b.slug} delay={i * 70}>
              <Link href={`/buildings/${b.slug}`}
                className="group block h-full overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-surface-card shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2">
                {b.cover && (
                  <div className="h-56 w-full overflow-hidden">
                    <Image src={b.cover.src} alt={b.cover.alt} width={480} height={300}
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="h-56 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-heading text-2xl text-text-accent">{b.name}</h3>
                  <p className="mt-1 text-base text-text-muted">{b.address}</p>
                  {b.comingSoon ? (
                    <span className="mt-3 inline-block rounded-full bg-[var(--color-surface-secondary)] px-3 py-1 text-xs font-medium text-text-secondary">
                      {t('comingSoonShort')}
                    </span>
                  ) : (
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-base text-text-muted">
                        {`${b.resolvedRooms.length} ${b.resolvedRooms.length === 1 ? t('roomType') : t('roomTypes')}`}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-primary)]/40 px-3 py-1 text-sm font-medium text-[var(--color-primary)] transition group-hover:bg-[var(--color-primary)] group-hover:text-white">
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

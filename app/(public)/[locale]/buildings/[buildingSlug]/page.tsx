import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Container from '@/components/Container';
import BookNowMenu from '@/components/BookNowMenu';
import { getBuildings, getBuilding } from '@/lib/content';
import { contacts } from '@/lib/content/site';
import type { Locale } from '@/i18n/routing';

export function generateStaticParams() {
  return getBuildings('en').map((b) => ({ buildingSlug: b.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; buildingSlug: string }> },
): Promise<Metadata> {
  const { locale, buildingSlug } = await params;
  const b = getBuilding(buildingSlug, locale as Locale);
  if (!b) return {};
  const t = await getTranslations({ locale, namespace: 'seo' });
  return {
    title: b.name,
    description: b.blurb,
    openGraph: { title: `${b.name} — ${t('titleSuffix')}`, description: b.blurb, images: b.cover ? [b.cover.src] : [] },
  };
}

export default async function BuildingPage(
  { params }: { params: Promise<{ locale: string; buildingSlug: string }> },
) {
  const { locale, buildingSlug } = await params;
  setRequestLocale(locale);
  const b = getBuilding(buildingSlug, locale as Locale);
  if (!b) notFound();
  const t = await getTranslations();

  return (
    <Container>
      <div className="mt-10">
        <h1 className="font-heading text-4xl text-text-accent">{b.name}</h1>
        <p className="text-text-muted">{b.address}</p>
        {b.googleMapsUrl && (
          <a href={b.googleMapsUrl} target="_blank" rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-text-accent hover:underline">
            {t('building.viewOnMaps')}
          </a>
        )}
        <p className="mt-4 max-w-2xl text-text-secondary">{b.blurb}</p>
      </div>

      {b.comingSoon ? (
        <div className="my-12 rounded-lg border border-[var(--color-border-default)] bg-surface-card p-8 text-center">
          <p className="font-heading text-2xl text-text-accent">{t('building.comingSoonTitle')}</p>
          <p className="mt-2 text-text-secondary">{t('building.comingSoonBody')}</p>
          <div className="mt-6 flex justify-center">
            <BookNowMenu contacts={contacts} message={t('inquiry.building', { building: b.name })} />
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {b.resolvedRooms.map((r) => (
              <Link key={r.slug} href={`/buildings/${b.slug}/${r.slug}`}
                className="group relative block overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-surface-card shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
                {r.cover.src && (
                  <div className="h-52 w-full overflow-hidden">
                    <Image src={r.cover.src} alt={r.cover.alt} width={480} height={320}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="h-52 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
                  </div>
                )}
                <span className="price-pill absolute left-3 top-3 rounded-full px-3 py-1 text-sm font-semibold text-[var(--color-text-primary)]">{r.price} · {t('room.perNight')}</span>
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium shadow-sm"
                  style={{ color: r.status === 'available' ? 'var(--color-status-confirmed)' : 'var(--color-status-cancelled)' }}>
                  {r.status === 'available' ? t('room.available') : t('room.notAvailable')}
                </span>
                <div className="p-5"><h3 className="font-heading text-xl text-text-accent">{r.name}</h3></div>
              </Link>
            ))}
          </div>
          <div className="mt-10">
            <BookNowMenu contacts={contacts} message={t('inquiry.building', { building: b.name })} />
          </div>
        </>
      )}
    </Container>
  );
}

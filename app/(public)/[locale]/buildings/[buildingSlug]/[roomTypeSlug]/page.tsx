import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Container from '@/components/Container';
import RoomGallery from '@/components/RoomGallery';
import BookNowButton from '@/components/BookNowButton';
import Amenities from '@/components/room/Amenities';
import LocationSection from '@/components/room/LocationSection';
import AroundSection from '@/components/room/AroundSection';
import Faq from '@/components/room/Faq';
import { getBuildings, getBuilding, getRoom, getFaq } from '@/lib/content';
import { localeAlternates } from '@/lib/seo';
import { lodgingJsonLd } from '@/lib/jsonld';
import { contacts } from '@/lib/content/site';
import type { Locale } from '@/i18n/routing';

export function generateStaticParams() {
  return getBuildings('en')
    .filter((b) => !b.comingSoon)
    .flatMap((b) => b.resolvedRooms.map((r) => ({ buildingSlug: b.slug, roomTypeSlug: r.slug })));
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; buildingSlug: string; roomTypeSlug: string }> },
): Promise<Metadata> {
  const { locale, buildingSlug, roomTypeSlug } = await params;
  const room = getRoom(buildingSlug, roomTypeSlug, locale as Locale);
  if (!room) return {};
  const t = await getTranslations({ locale, namespace: 'seo' });
  return {
    title: `${room.name} · ${room.buildingName}`,
    description: room.blurb,
    alternates: localeAlternates(locale, `/buildings/${buildingSlug}/${roomTypeSlug}`),
    openGraph: { title: `${room.name} · ${room.buildingName} — ${t('titleSuffix')}`, description: room.blurb, images: room.cover.src ? [room.cover.src] : [] },
  };
}

export default async function RoomPage(
  { params }: { params: Promise<{ locale: string; buildingSlug: string; roomTypeSlug: string }> },
) {
  const { locale, buildingSlug, roomTypeSlug } = await params;
  setRequestLocale(locale);
  const building = getBuilding(buildingSlug, locale as Locale);
  const room = getRoom(buildingSlug, roomTypeSlug, locale as Locale);
  if (!building || building.comingSoon || !room) notFound();
  const t = await getTranslations();

  const h = await headers();
  const host = h.get('host') ?? '';
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const localePrefix = locale === 'en' ? '' : locale === 'zh-Hans' ? '/zh' : `/${locale}`;
  const url = host ? `${proto}://${host}${localePrefix}/buildings/${buildingSlug}/${roomTypeSlug}` : '';
  const message = t('inquiry.room', { roomType: room.name, building: building.name, url });
  const faq = getFaq(locale as Locale);

  const available = room.status === 'available';
  const priceVnd = Number(room.price.replace(/[^\d]/g, '')) || null;
  const jsonLd = lodgingJsonLd({
    locale,
    path: `/buildings/${buildingSlug}/${roomTypeSlug}`,
    name: `${room.name} · ${room.buildingName}`,
    description: room.blurb,
    image: room.cover?.src,
    streetAddress: building.address,
    telephone: contacts.phone ?? undefined,
    priceVnd,
  });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <Container>
      <Link href={`/buildings/${building.slug}`} className="mt-8 inline-block text-sm text-text-muted hover:text-text-accent">
        ← {building.name}
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <h1 className="font-heading text-4xl text-text-accent">{room.name}</h1>
        <span className="price-pill rounded-full px-3 py-1 text-sm font-semibold text-[var(--color-text-primary)]">{room.price} · {t('room.perNight')}</span>
        <span className={`text-sm font-medium ${available ? 'text-status-confirmed' : 'text-status-cancelled'}`}>
          {available ? t('room.available') : t('room.notAvailable')}
        </span>
      </div>
      <p className="mt-4 max-w-2xl text-text-secondary">{room.blurb}</p>
      <div className="mt-6"><RoomGallery images={room.images} /></div>
      <div className="mt-8"><BookNowButton /></div>

      <Amenities amenities={building.amenities} />
      <LocationSection
        address={building.address}
        mapsUrl={building.mapsUrl}
        embedUrl={building.embedUrl}
        directionsUrl={building.directionsUrl}
        whatsapp={contacts.whatsapp}
        message={message}
      />
      <AroundSection landmarks={building.landmarks} />
      <Faq items={faq} />
      </Container>
    </>
  );
}

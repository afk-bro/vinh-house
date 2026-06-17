// app/buildings/[buildingSlug]/[roomTypeSlug]/page.tsx
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Container from '@/components/Container';
import RoomGallery from '@/components/RoomGallery';
import BookNowMenu from '@/components/BookNowMenu';
import { getBuildings, getBuilding, getRoom } from '@/lib/content';
import { contacts } from '@/lib/content/site';
import { inquiryMessage } from '@/lib/content/inquiry';
import { t } from '@/lib/content/strings';

export function generateStaticParams() {
  return getBuildings()
    .filter((b) => !b.comingSoon)
    .flatMap((b) => b.resolvedRooms.map((r) => ({ buildingSlug: b.slug, roomTypeSlug: r.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ buildingSlug: string; roomTypeSlug: string }> }): Promise<Metadata> {
  const { buildingSlug, roomTypeSlug } = await params;
  const room = getRoom(buildingSlug, roomTypeSlug);
  if (!room) return {};
  return {
    title: `${room.name} at ${room.buildingName}`,
    description: room.blurb,
    openGraph: { title: `${room.name} at ${room.buildingName} — Vĩnh House`, description: room.blurb, images: room.cover.src ? [room.cover.src] : [] },
  };
}

export default async function RoomPage({ params }: { params: Promise<{ buildingSlug: string; roomTypeSlug: string }> }) {
  const { buildingSlug, roomTypeSlug } = await params;
  const building = getBuilding(buildingSlug);
  const room = getRoom(buildingSlug, roomTypeSlug);
  if (!building || building.comingSoon || !room) notFound();

  // Build absolute URL for the inquiry message.
  const h = await headers();
  const host = h.get('host') ?? '';
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const url = host ? `${proto}://${host}/buildings/${buildingSlug}/${roomTypeSlug}` : '';
  const message = inquiryMessage({ building: building.name, roomType: room.name, url });

  const available = room.status === 'available';
  return (
    <Container>
      <Link href={`/buildings/${building.slug}`} className="mt-8 inline-block text-sm text-text-muted hover:text-text-accent">
        ← {building.name}
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <h1 className="font-heading text-4xl text-text-accent">{room.name}</h1>
        <span className="rounded-full bg-accent-gold px-3 py-1 text-text-inverse">{room.price}</span>
        <span className={available ? 'text-status-confirmed' : 'text-status-cancelled'}>
          {available ? t.room.available : t.room.notAvailable}
        </span>
      </div>
      <p className="mt-4 max-w-2xl text-text-secondary">{room.blurb}</p>

      <div className="mt-6">
        <RoomGallery images={room.images} />
      </div>

      <div className="mt-8">
        <BookNowMenu contacts={contacts} message={message} />
      </div>
    </Container>
  );
}

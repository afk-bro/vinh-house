import Link from 'next/link';
import Image from 'next/image';
import { getCover, type Photo } from '@/lib/photos';

type Room = { id: string; name: string; price: number | null; status: string; photos: Photo[] };

export default function RoomCard({ room }: { room: Room }) {
  const cover = getCover(room.photos ?? []);
  const available = room.status === 'available';
  return (
    <Link href={`/rooms/${room.id}`} className="block relative border border-[var(--color-border-default)] bg-surface-card">
      {cover && <Image src={cover.url} alt={cover.alt || room.name} width={480} height={320}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover w-full h-52" />}
      {room.price != null && (
        <span className="absolute top-3 left-3 px-3 py-1 bg-accent-gold text-text-inverse text-sm font-medium rounded-full">
          ${room.price.toLocaleString()}
        </span>
      )}
      <span
        className={`absolute top-3 right-3 px-2 py-1 text-xs rounded-full ${
          available ? 'text-status-confirmed' : 'text-status-cancelled'}`}
        style={{
          background: available
            ? 'var(--color-status-confirmed-bg)'
            : 'var(--color-status-cancelled-bg)',
        }}
      >
        {available ? 'Available' : 'Not available'}
      </span>
      <div className="p-4"><h3 className="font-heading text-xl text-text-primary">{room.name}</h3></div>
    </Link>
  );
}

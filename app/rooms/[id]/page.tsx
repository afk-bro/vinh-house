import Image from 'next/image';
import Link from 'next/link';
import Container from '@/components/Container';
import { createClient } from '@/lib/supabase/server';
import InquiryLinks from '@/components/InquiryLinks';
import { getCover, type Photo } from '@/lib/photos';

export default async function RoomDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: r } = await supabase
    .from('rooms').select('*, buildings(id, name)').eq('id', id).single();
  const { data: settings } = await supabase
    .from('site_settings').select('whatsapp_number, messenger_url, contact_email').limit(1).single();
  if (!r) return <Container><p className="mt-10 text-text-primary">Room not found.</p></Container>;

  const photos = (r.photos ?? []) as Photo[];
  const cover = getCover(photos);
  const available = r.status === 'available';

  return (
    <Container>
      {r.buildings && (
        <Link href={`/buildings/${r.buildings.id}`} className="text-text-muted text-sm">← {r.buildings.name}</Link>
      )}
      <div className="flex items-center gap-4 mt-2">
        <h1 className="font-heading text-4xl text-text-accent">{r.name}</h1>
        {r.price != null && <span className="px-3 py-1 bg-accent-gold text-text-inverse rounded-full">${r.price.toLocaleString()}</span>}
        <span className={available ? 'text-status-confirmed' : 'text-status-cancelled'}>
          {available ? 'Available' : 'Not available'}
        </span>
      </div>
      {r.description && <p className="text-text-secondary mt-4 max-w-2xl">{r.description}</p>}

      {cover && <Image src={cover.url} alt={cover.alt || r.name} width={960} height={600}
        priority
        className="object-cover w-full max-h-[28rem] mt-6" />}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
        {photos.filter((p) => p.url !== cover?.url).map((p, i) => (
          <Image key={p.url} src={p.url} alt={p.alt || `${r.name} photo ${i + 1}`} width={240} height={160}
            className="object-cover w-full h-28" />
        ))}
      </div>

      {settings && <InquiryLinks contacts={settings} roomName={r.name} />}
    </Container>
  );
}

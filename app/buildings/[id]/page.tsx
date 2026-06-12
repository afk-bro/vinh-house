import Container from '@/components/Container';
import { createClient } from '@/lib/supabase/server';
import RoomCard from '@/components/RoomCard';
import type { Photo } from '@/lib/photos';

export default async function BuildingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: b } = await supabase.from('buildings').select('*').eq('id', id).single();
  const { data: rooms } = await supabase
    .from('rooms').select('id, name, price, status, photos').eq('building_id', id).order('sort_order');
  if (!b) return <Container><p className="mt-10 text-text-primary">Building not found.</p></Container>;

  return (
    <Container>
      <h1 className="font-heading text-4xl text-text-accent mt-10">{b.name}</h1>
      {b.address && <p className="text-text-muted">{b.address}</p>}
      {b.description && <p className="text-text-secondary mt-4 max-w-2xl">{b.description}</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {(rooms ?? []).map((r) => (
          <RoomCard key={r.id} room={{ ...r, photos: (r.photos ?? []) as Photo[] }} />
        ))}
      </div>
      {!rooms?.length && <p className="text-text-muted mt-8">No rooms listed yet.</p>}
    </Container>
  );
}

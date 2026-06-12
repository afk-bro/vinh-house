import Link from 'next/link';
import Container from '@/components/Container';
import { createClient } from '@/lib/supabase/server';
import DeleteForm from '@/components/admin/DeleteForm';
import { updateBuilding, deleteRoom } from '../../actions';

export default async function EditBuilding({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: b } = await supabase.from('buildings').select('*').eq('id', id).single();
  const { data: rooms } = await supabase
    .from('rooms').select('id, name, price, status').eq('building_id', id).order('sort_order');
  if (!b) return <Container><p className="mt-8 text-text-primary">Not found.</p></Container>;

  return (
    <Container>
      <h1 className="font-heading text-3xl text-text-accent mt-8">Edit building</h1>
      <form action={updateBuilding} className="mt-6 space-y-4 max-w-lg">
        <input type="hidden" name="id" value={b.id} />
        <label className="block text-text-secondary text-sm">Building name
          <input name="name" defaultValue={b.name} required
            className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" /></label>
        <label className="block text-text-secondary text-sm">Address
          <input name="address" defaultValue={b.address ?? ''}
            className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" /></label>
        <label className="block text-text-secondary text-sm">Description
          <textarea name="description" defaultValue={b.description ?? ''} rows={4}
            className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" /></label>
        <button className="px-4 py-2 bg-accent-gold text-text-inverse">Save</button>
      </form>

      <div className="flex items-center justify-between mt-10">
        <h2 className="font-heading text-2xl text-text-accent">Rooms</h2>
        <Link href={`/admin/rooms/new?building=${b.id}`} className="text-text-accent underline">+ New room</Link>
      </div>
      <ul className="mt-4 divide-y divide-[var(--color-border-subtle)]">
        {(rooms ?? []).map((r) => (
          <li key={r.id} className="py-3 flex items-center justify-between">
            <Link href={`/admin/rooms/${r.id}/edit`} className="text-text-primary">
              {r.name} — {r.price != null ? `$${r.price}` : 'no price'} — {r.status}
            </Link>
            <DeleteForm action={deleteRoom}
              confirmMessage="Delete this room? This cannot be undone.">
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="buildingId" value={b.id} />
              <button className="text-status-cancelled text-sm">Delete</button>
            </DeleteForm>
          </li>
        ))}
      </ul>
    </Container>
  );
}

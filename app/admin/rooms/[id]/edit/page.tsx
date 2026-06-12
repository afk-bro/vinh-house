import Container from '@/components/Container';
import { createClient } from '@/lib/supabase/server';
import { updateRoom } from '../../actions';
import RoomPhotoManager from '@/components/admin/RoomPhotoManager';
import type { Photo } from '@/lib/photos';

export default async function EditRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: r } = await supabase.from('rooms').select('*').eq('id', id).single();
  if (!r) return <Container><p className="mt-8 text-text-primary">Not found.</p></Container>;

  return (
    <Container>
      <h1 className="font-heading text-3xl text-text-accent mt-8">Edit room</h1>
      <form action={updateRoom} className="mt-6 space-y-4 max-w-lg">
        <input type="hidden" name="id" value={r.id} />
        <input type="hidden" name="building_id" value={r.building_id} />
        <label className="block text-text-secondary text-sm">Room name / number
          <input name="name" defaultValue={r.name} required
            className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" /></label>
        <label className="block text-text-secondary text-sm">Price
          <input name="price" type="number" step="0.01" defaultValue={r.price ?? ''}
            className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" /></label>
        <label className="block text-text-secondary text-sm">Status
          <select name="status" defaultValue={r.status}
            className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary">
            <option value="available">Available</option>
            <option value="not_available">Not available</option>
          </select></label>
        <label className="block text-text-secondary text-sm">Description
          <textarea name="description" defaultValue={r.description ?? ''} rows={4}
            className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" /></label>
        <button className="px-4 py-2 bg-accent-gold text-text-inverse">Save</button>
      </form>

      <h2 className="font-heading text-2xl text-text-accent mt-10">Photos</h2>
      <RoomPhotoManager roomId={r.id} initial={(r.photos ?? []) as Photo[]} />
    </Container>
  );
}

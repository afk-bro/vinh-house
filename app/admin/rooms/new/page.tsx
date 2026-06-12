import Container from '@/components/Container';
import { createRoom } from '../actions';

export default async function NewRoom({ searchParams }: { searchParams: Promise<{ building?: string }> }) {
  const { building } = await searchParams;
  return (
    <Container>
      <h1 className="font-heading text-3xl text-text-accent mt-8">New room</h1>
      <form action={createRoom} className="mt-6 space-y-4 max-w-lg">
        <input type="hidden" name="building_id" value={building ?? ''} />
        <input name="name" required placeholder="Room name / number"
          className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" />
        <input name="price" type="number" step="0.01" placeholder="Price"
          className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" />
        <select name="status" defaultValue="available"
          className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary">
          <option value="available">Available</option>
          <option value="not_available">Not available</option>
        </select>
        <textarea name="description" placeholder="Description" rows={4}
          className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" />
        <button className="px-4 py-2 bg-accent-gold text-text-inverse">Create &amp; add photos</button>
      </form>
    </Container>
  );
}

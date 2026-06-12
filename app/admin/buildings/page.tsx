import Link from 'next/link';
import Container from '@/components/Container';
import { createClient } from '@/lib/supabase/server';
import { deleteBuilding } from './actions';

export default async function BuildingsList() {
  const supabase = await createClient();
  const { data: buildings } = await supabase
    .from('buildings').select('id, name, address').order('sort_order');

  return (
    <Container>
      <div className="flex items-center justify-between mt-8">
        <h1 className="font-heading text-3xl text-text-accent">Buildings</h1>
        <Link href="/admin/buildings/new" className="text-text-accent underline">+ New building</Link>
      </div>
      <ul className="mt-6 divide-y divide-[var(--color-border-subtle)]">
        {(buildings ?? []).map((b) => (
          <li key={b.id} className="py-3 flex items-center justify-between">
            <Link href={`/admin/buildings/${b.id}/edit`} className="text-text-primary">
              {b.name}{b.address ? ` — ${b.address}` : ''}
            </Link>
            <form action={deleteBuilding}>
              <input type="hidden" name="id" value={b.id} />
              <button className="text-status-cancelled text-sm">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </Container>
  );
}

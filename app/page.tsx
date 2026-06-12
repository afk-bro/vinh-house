import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/Container';
import { createClient } from '@/lib/supabase/server';
import { getCover, type Photo } from '@/lib/photos';

export default async function Home() {
  const supabase = await createClient();
  const { data: buildings } = await supabase
    .from('buildings').select('id, name, address, photos').order('sort_order');

  return (
    <Container>
      <h1 className="font-heading text-4xl text-text-accent mt-10">Our buildings</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {(buildings ?? []).map((b) => {
          const cover = getCover((b.photos ?? []) as Photo[]);
          return (
            <Link key={b.id} href={`/buildings/${b.id}`}
              className="block border border-[var(--color-border-default)] bg-surface-card">
              {cover && <Image src={cover.url} alt={cover.alt || b.name} width={480} height={300}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover w-full h-48" />}
              <div className="p-4">
                <h2 className="font-heading text-2xl text-text-primary">{b.name}</h2>
                {b.address && <p className="text-text-muted text-sm">{b.address}</p>}
              </div>
            </Link>
          );
        })}
      </div>
      {!buildings?.length && <p className="text-text-muted mt-8">No listings yet — check back soon.</p>}
    </Container>
  );
}

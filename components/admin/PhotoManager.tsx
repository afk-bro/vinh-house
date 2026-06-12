'use client';
import { useState } from 'react';
import Image from 'next/image';
import { addPhoto, removePhoto, setCover, type Photo } from '@/lib/photos';

export default function PhotoManager({
  kind,
  ownerId,
  initial,
  save,
}: {
  kind: 'rooms' | 'buildings';
  ownerId: string;
  initial: Photo[];
  save: (ownerId: string, photos: Photo[]) => Promise<void>;
}) {
  const [photos, setPhotos] = useState<Photo[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function persist(next: Photo[]) {
    setPhotos(next);
    await save(ownerId, next);
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setBusy(true);
    setError(null);
    let next = photos;
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('kind', kind);
        fd.append('ownerId', ownerId);
        const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd });
        if (res.ok) {
          const { url } = await res.json();
          next = addPhoto(next, url, '');
        } else {
          const body = await res.json().catch(() => ({}));
          setError(`${file.name}: ${body.error ?? 'upload failed'}`);
        }
      }
      await persist(next);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  return (
    <div className="mt-4">
      <input type="file" accept="image/*" multiple onChange={onUpload} disabled={busy} />
      {busy && <p className="text-text-muted text-sm mt-2">Uploading…</p>}
      {error && <p className="text-status-cancelled text-sm mt-2">{error}</p>}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {photos.map((p) => (
          <figure key={p.url} className="relative border border-[var(--color-border-default)]">
            <Image src={p.url} alt={p.alt} width={240} height={160} className="object-cover w-full h-32" />
            <figcaption className="flex justify-between items-center p-1 text-xs">
              <button type="button" onClick={() => persist(setCover(photos, p.url))}
                className={p.is_cover ? 'text-accent-gold' : 'text-text-muted'}>
                {p.is_cover ? '★ cover' : 'set cover'}
              </button>
              <button type="button" onClick={() => persist(removePhoto(photos, p.url))}
                className="text-status-cancelled">remove</button>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

// components/RoomGallery.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import ImageLightbox from './ImageLightbox';

type Img = { src: string; alt: string };

export default function RoomGallery({ images }: { images: Img[] }) {
  const [index, setIndex] = useState<number | null>(null);
  if (images.length === 0) return null;

  return (
    <>
      <button className="block w-full" onClick={() => setIndex(0)} aria-label="Open gallery">
        <Image src={images[0].src} alt={images[0].alt} width={960} height={600} priority
          className="max-h-[28rem] w-full rounded-lg object-cover" />
      </button>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.slice(1).map((img, i) => (
            <button key={img.src} onClick={() => setIndex(i + 1)} aria-label={`Open image ${i + 2}`}>
              <Image src={img.src} alt={img.alt} width={240} height={160} className="h-28 w-full rounded object-cover" />
            </button>
          ))}
        </div>
      )}
      {index !== null && (
        <ImageLightbox
          images={images}
          currentIndex={index}
          onClose={() => setIndex(null)}
          onNext={() => setIndex((i) => (i === null ? 0 : (i + 1) % images.length))}
          onPrevious={() => setIndex((i) => (i === null ? 0 : (i - 1 + images.length) % images.length))}
        />
      )}
    </>
  );
}

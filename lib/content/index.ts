// lib/content/index.ts
import type { BuildingMeta } from './types';
import { listImages, imageUrl, PHOTOS_BASE, scanDisk } from './loader';
import { pick } from './localize';
import { buildings } from './site';
import type { Locale } from '@/i18n/routing';
import { resolveAmenities, type ResolvedAmenity } from './amenities';
import { mapsUrl, embedUrl, directionsUrl } from './maps';
import path from 'node:path';

export type Img = { src: string; alt: string };
export type ResolvedRoom = {
  slug: string; name: string; price: string; status: 'available' | 'unavailable';
  buildingSlug: string; buildingName: string; blurb: string; alt: string; cover: Img; images: Img[];
};
export type ResolvedLandmark = { id: string; name: string; distance: string };
export type ResolvedBuilding = {
  slug: string; folder: string; name: string; address: string; googleMapsUrl: string;
  blurb: string; alt: string; sortOrder: number; hidden?: boolean; comingSoon?: boolean;
  cover: Img | null; images: Img[]; resolvedRooms: ResolvedRoom[];
  amenities: ResolvedAmenity[]; landmarks: ResolvedLandmark[];
  mapsUrl: string; embedUrl: string; directionsUrl: string;
};

/** Pure resolver: metadata + locale + folderPath->filenames map -> resolved building. */
export function resolveBuilding(
  meta: BuildingMeta,
  locale: Locale,
  imagesByPath: Record<string, string[]>,
): ResolvedBuilding {
  const bAlt = pick(meta.alt, locale);
  const bFiles = imagesByPath[meta.folder] ?? [];
  const images = bFiles.map((f) => ({ src: imageUrl(meta.folder, f), alt: bAlt }));
  const resolvedRooms: ResolvedRoom[] = meta.rooms.map((r) => {
    const rAlt = pick(r.alt, locale);
    const rFiles = imagesByPath[`${meta.folder}/${r.slug}`] ?? [];
    const rImages = rFiles.map((f) => ({ src: imageUrl(meta.folder, f, r.slug), alt: rAlt }));
    return {
      slug: r.slug, name: pick(r.name, locale), price: r.price, status: r.status,
      buildingSlug: meta.slug, buildingName: meta.name, blurb: pick(r.blurb, locale), alt: rAlt,
      cover: rImages[0] ?? { src: '', alt: rAlt }, images: rImages,
    };
  });
  return {
    slug: meta.slug, folder: meta.folder, name: meta.name, address: meta.address,
    googleMapsUrl: meta.googleMapsUrl, blurb: pick(meta.blurb, locale), alt: bAlt,
    sortOrder: meta.sortOrder, hidden: meta.hidden, comingSoon: meta.comingSoon,
    cover: images[0] ?? null, images, resolvedRooms,
    amenities: resolveAmenities(meta.amenityIds ?? [], locale),
    landmarks: (meta.landmarks ?? []).map((l) => ({ id: l.id, name: pick(l.name, locale), distance: l.distance })),
    mapsUrl: mapsUrl(meta), embedUrl: embedUrl(meta), directionsUrl: directionsUrl(meta),
  };
}

function imagesMapFor(meta: BuildingMeta): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  map[meta.folder] = listImages(path.join(PHOTOS_BASE, meta.folder));
  for (const r of meta.rooms) {
    map[`${meta.folder}/${r.slug}`] = listImages(path.join(PHOTOS_BASE, meta.folder, r.slug));
  }
  return map;
}

export function getBuildings(locale: Locale): ResolvedBuilding[] {
  return buildings
    .filter((b) => !b.hidden)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((b) => resolveBuilding(b, locale, imagesMapFor(b)));
}

export function getBuilding(slug: string, locale: Locale): ResolvedBuilding | undefined {
  return getBuildings(locale).find((b) => b.slug === slug);
}

export function getRoom(buildingSlug: string, roomSlug: string, locale: Locale): ResolvedRoom | undefined {
  return getBuilding(buildingSlug, locale)?.resolvedRooms.find((r) => r.slug === roomSlug);
}

export { scanDisk, PHOTOS_BASE };
export { getFaq } from './faq';
export type { ResolvedFaq } from './faq';

// lib/content/index.ts
import type { BuildingMeta, RoomMeta } from './types';
import { listImages, scanDisk, imageUrl, PHOTOS_BASE } from './loader';
import { buildings } from './site';
import path from 'node:path';

export type Img = { src: string; alt: string };
export type ResolvedRoom = RoomMeta & { buildingSlug: string; buildingName: string; cover: Img; images: Img[] };
export type ResolvedBuilding = BuildingMeta & { cover: Img | null; images: Img[]; resolvedRooms: ResolvedRoom[] };

/** Pure resolver: merges metadata with a map of folderPath -> image filenames. */
export function resolveBuilding(
  meta: BuildingMeta,
  imagesByPath: Record<string, string[]>,
): ResolvedBuilding & { rooms: ResolvedRoom[] } {
  const bFiles = imagesByPath[meta.folder] ?? [];
  const images = bFiles.map((f) => ({ src: imageUrl(meta.folder, f), alt: meta.alt }));
  const cover = images[0] ?? null;
  const resolvedRooms: ResolvedRoom[] = meta.rooms.map((r) => {
    const rFiles = imagesByPath[`${meta.folder}/${r.slug}`] ?? [];
    const rImages = rFiles.map((f) => ({ src: imageUrl(meta.folder, f, r.slug), alt: r.alt }));
    return { ...r, buildingSlug: meta.slug, buildingName: meta.name, cover: rImages[0] ?? { src: '', alt: r.alt }, images: rImages };
  });
  return { ...meta, cover, images, resolvedRooms, rooms: resolvedRooms };
}

/** Build-time: scan disk and produce a folderPath -> filenames map for a building. */
function imagesMapFor(meta: BuildingMeta): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  map[meta.folder] = listImages(path.join(PHOTOS_BASE, meta.folder));
  for (const r of meta.rooms) {
    map[`${meta.folder}/${r.slug}`] = listImages(path.join(PHOTOS_BASE, meta.folder, r.slug));
  }
  return map;
}

/** All visible (non-hidden) buildings, sorted, with resolved images. */
export function getBuildings(): ResolvedBuilding[] {
  return buildings
    .filter((b) => !b.hidden)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((b) => resolveBuilding(b, imagesMapFor(b)));
}

export function getBuilding(slug: string): ResolvedBuilding | undefined {
  return getBuildings().find((b) => b.slug === slug);
}

export function getRoom(buildingSlug: string, roomSlug: string): ResolvedRoom | undefined {
  return getBuilding(buildingSlug)?.resolvedRooms.find((r) => r.slug === roomSlug);
}

/** Current disk snapshot for validation. */
export { scanDisk, PHOTOS_BASE };

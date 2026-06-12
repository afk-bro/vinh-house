export type Photo = { url: string; alt: string; is_cover: boolean };

/** The cover photo, or the first photo if none is flagged, or undefined when empty. */
export function getCover(photos: Photo[]): Photo | undefined {
  return photos.find((p) => p.is_cover) ?? photos[0];
}

/** Returns a new array with exactly the given url flagged as cover. */
export function setCover(photos: Photo[], url: string): Photo[] {
  return photos.map((p) => ({ ...p, is_cover: p.url === url }));
}

/** Appends a photo; first photo added becomes the cover automatically. */
export function addPhoto(photos: Photo[], url: string, alt = ''): Photo[] {
  const isFirst = photos.length === 0;
  return [...photos, { url, alt, is_cover: isFirst }];
}

/** Removes a photo by url; if the cover was removed, the new first photo becomes cover. */
export function removePhoto(photos: Photo[], url: string): Photo[] {
  const next = photos.filter((p) => p.url !== url);
  if (next.length > 0 && !next.some((p) => p.is_cover)) next[0] = { ...next[0], is_cover: true };
  return next;
}

/** Moves the photo at `from` to index `to` (gallery reorder). */
export function reorder(photos: Photo[], from: number, to: number): Photo[] {
  if (from < 0 || from >= photos.length || to < 0 || to > photos.length) return [...photos];
  const next = [...photos];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

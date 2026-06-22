// lib/content/loader.ts
import fs from 'node:fs';
import path from 'node:path';

const IMAGE_RE = /\.(jpe?g|png|webp)$/i;
// A cover file is `cover.<ext>` in any supported format (not just .jpg).
const COVER_RE = /^cover\.(jpe?g|png|webp)$/i;

function isDir(p: string): boolean {
  return fs.existsSync(p) && fs.statSync(p).isDirectory();
}

/** Whether a folder contains a cover image (cover.jpg/jpeg/png/webp). */
function hasCoverFile(dir: string): boolean {
  return isDir(dir) && fs.readdirSync(dir).some((f) => COVER_RE.test(f));
}

/** Image filenames in a folder, sorted alphabetically but with the cover image first. */
export function listImages(dir: string): string[] {
  if (!isDir(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => IMAGE_RE.test(f))
    .sort((a, b) => {
      const aCover = COVER_RE.test(a);
      const bCover = COVER_RE.test(b);
      if (aCover !== bCover) return aCover ? -1 : 1;
      return a.localeCompare(b);
    });
}

export type DiskRoom = { folder: string; hasCover: boolean };
export type DiskBuilding = { folder: string; hasCover: boolean; rooms: DiskRoom[] };

/** Scans a photos base directory into a normalized snapshot for validation/rendering. */
export function scanDisk(baseDir: string): DiskBuilding[] {
  if (!isDir(baseDir)) return [];
  return fs
    .readdirSync(baseDir)
    .filter((name) => isDir(path.join(baseDir, name)))
    .sort()
    .map((folder) => {
      const dir = path.join(baseDir, folder);
      const rooms: DiskRoom[] = fs
        .readdirSync(dir)
        .filter((name) => isDir(path.join(dir, name)))
        .sort()
        .map((roomFolder) => ({
          folder: roomFolder,
          hasCover: hasCoverFile(path.join(dir, roomFolder)),
        }));
      return {
        folder,
        hasCover: hasCoverFile(dir),
        rooms,
      };
    });
}

/** Absolute base directory of committed photos. */
export const PHOTOS_BASE = path.join(process.cwd(), 'public', 'Phap_photos');

/** Public URL for an image inside a building (and optional room) folder. */
export function imageUrl(buildingFolder: string, file: string, roomFolder?: string): string {
  return roomFolder
    ? `/Phap_photos/${buildingFolder}/${roomFolder}/${file}`
    : `/Phap_photos/${buildingFolder}/${file}`;
}

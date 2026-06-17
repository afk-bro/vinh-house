// lib/content/loader.ts
import fs from 'node:fs';
import path from 'node:path';

const IMAGE_RE = /\.(jpe?g|png|webp)$/i;

function isDir(p: string): boolean {
  return fs.existsSync(p) && fs.statSync(p).isDirectory();
}

/** Image filenames in a folder, sorted alphabetically but with cover.jpg first. */
export function listImages(dir: string): string[] {
  if (!isDir(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((f) => IMAGE_RE.test(f))
    .sort();
  return files.sort((a, b) => (a === 'cover.jpg' ? -1 : b === 'cover.jpg' ? 1 : 0));
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
          hasCover: fs.existsSync(path.join(dir, roomFolder, 'cover.jpg')),
        }));
      return {
        folder,
        hasCover: fs.existsSync(path.join(dir, 'cover.jpg')),
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

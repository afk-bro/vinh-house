// lib/content/validate.ts
import type { BuildingMeta } from './types';
import type { DiskBuilding } from './loader';

export type ValidationResult = { errors: string[]; warnings: string[] };

/** Pure validation of metadata against a disk snapshot. Errors must block the build. */
export function validateContent(meta: BuildingMeta[], disk: DiskBuilding[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Slug uniqueness (buildings)
  const seen = new Set<string>();
  for (const b of meta) {
    if (seen.has(b.slug)) errors.push(`Duplicate building slug "${b.slug}"`);
    seen.add(b.slug);
  }

  const diskByFolder = new Map(disk.map((d) => [d.folder, d]));
  const metaByFolder = new Map(meta.map((m) => [m.folder, m]));

  // Disk folder with no metadata
  for (const d of disk) {
    if (!metaByFolder.has(d.folder)) {
      errors.push(`Building folder "${d.folder}" has no metadata in site.ts`);
    }
  }

  for (const b of meta) {
    const d = diskByFolder.get(b.folder);
    if (!d) {
      errors.push(`Building "${b.name}" (folder "${b.folder}") has no folder on disk`);
      continue;
    }

    if (b.comingSoon) {
      if (d.rooms.length > 0) {
        errors.push(`Building "${b.name}" is comingSoon but has room folders on disk`);
      }
      if (b.rooms.length > 0) {
        errors.push(`Building "${b.name}" is comingSoon but has room metadata`);
      }
      continue; // coming-soon buildings are exempt from cover/room checks below
    }

    if (!d.hasCover) errors.push(`Building "${b.folder}" is missing a cover image (cover.jpg/png/webp)`);

    // Room slug uniqueness within building
    const roomSeen = new Set<string>();
    for (const r of b.rooms) {
      if (roomSeen.has(r.slug)) errors.push(`Duplicate room slug "${r.slug}" in "${b.name}"`);
      roomSeen.add(r.slug);
      if (r.price.includes('—')) warnings.push(`Room "${r.name}" in "${b.name}" has a placeholder price`);
    }

    // Room folder ↔ metadata drift + room covers
    const diskRoomFolders = new Set(d.rooms.map((r) => r.folder));
    const metaRoomFolders = new Set(b.rooms.map((r) => r.slug));
    for (const dr of d.rooms) {
      if (!metaRoomFolders.has(dr.folder)) {
        errors.push(`Room folder "${dr.folder}" in "${b.folder}" has no metadata`);
      }
      if (!dr.hasCover) errors.push(`Room "${dr.folder}" in "${b.folder}" is missing a cover image (cover.jpg/png/webp)`);
    }
    for (const r of b.rooms) {
      if (!diskRoomFolders.has(r.slug)) {
        errors.push(`Room metadata "${r.slug}" in "${b.name}" has no folder on disk`);
      }
    }
  }

  return { errors, warnings };
}

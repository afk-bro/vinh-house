// lib/content/site.ts
import type { BuildingMeta, Contacts } from './types';

// ⚠️ PLACEHOLDERS — replace with real values when the client provides them.
export const contacts: Contacts = {
  email: 'CHANGEME@example.com',
  phone: '+84 92 442 22 99',
  whatsapp: '+84 92 442 22 99',
  facebook: 'https://facebook.com/CHANGEME',
  motorbikeUrl: 'https://vinhphatmotorbikes.com',
};

export const buildings: BuildingMeta[] = [
  {
    slug: 'gilda-hotel',
    folder: 'Gilda-Hotel',
    name: 'Gilda Hotel',
    address: '89 Cao Bá Quát, An Hải, Đà Nẵng 550000, Vietnam',
    googleMapsUrl: 'https://maps.google.com/?q=89+Cao+Ba+Quat+Da+Nang',
    blurb: 'Boutique rooms in An Hải, steps from the beach.',
    alt: 'Exterior and rooms at Gilda Hotel in Da Nang',
    sortOrder: 1,
    rooms: [
      { slug: '1-bedroom', name: '1 Bedroom', price: '$— / month', blurb: 'Description coming soon.', status: 'available', alt: '1-bedroom apartment at Gilda Hotel' },
      { slug: '2-bedroom', name: '2 Bedroom', price: '$— / month', blurb: 'Description coming soon.', status: 'available', alt: '2-bedroom apartment at Gilda Hotel' },
    ],
  },
  {
    slug: 'azure-apartments',
    folder: 'Azure-Apartments',
    name: 'Azure Apartments',
    address: 'Da Nang, Vietnam',
    googleMapsUrl: 'https://maps.google.com/?q=Da+Nang',
    blurb: 'Details coming soon.',
    alt: 'Azure Apartments in Da Nang',
    sortOrder: 2,
    comingSoon: true,
    rooms: [],
  },
];

/** Nav-safe building list (excludes hidden), sorted. For client components. */
export function buildingNav(): { slug: string; name: string; comingSoon: boolean }[] {
  return buildings
    .filter((b) => !b.hidden)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((b) => ({ slug: b.slug, name: b.name, comingSoon: !!b.comingSoon }));
}

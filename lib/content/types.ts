// lib/content/types.ts
import type { Localized } from './localize';

export type Contacts = {
  email: string;
  phone: string;
  whatsapp: string;
  facebook: string;
  motorbikeUrl: string;
};

export type RoomMeta = {
  slug: string;
  name: Localized<string>;   // e.g. "1 Bedroom" / "1 Phòng ngủ"
  price: string;             // single-source (format/placeholder)
  blurb: Localized<string>;
  status: 'available' | 'unavailable';
  alt: Localized<string>;
};

export type BuildingMeta = {
  slug: string;
  folder: string;
  name: string;              // brand proper noun — single-source
  address: string;           // single-source
  googleMapsUrl: string;
  blurb: Localized<string>;
  alt: Localized<string>;
  sortOrder: number;
  hidden?: boolean;
  comingSoon?: boolean;
  rooms: RoomMeta[];
};

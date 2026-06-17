// lib/content/types.ts

/** Global, business-wide contact info (placeholders until client provides real values). */
export type Contacts = {
  email: string;
  phone: string;        // display + tel source, e.g. "+84 92 442 22 99"
  whatsapp: string;     // number, e.g. "+84 92 442 22 99"
  facebook: string;     // full URL
  motorbikeUrl: string; // scooter rental site
};

export type RoomMeta = {
  /** Must equal slugify(folder name) of the room subfolder. */
  slug: string;
  name: string;         // display, e.g. "1 Bedroom"
  price: string;        // e.g. "$— / month" placeholder
  blurb: string;
  status: 'available' | 'unavailable';
  alt: string;          // default alt text for this room's images
};

export type BuildingMeta = {
  /** Must equal slugify(folder). */
  slug: string;
  /** Exact folder name under public/Phap_photos. */
  folder: string;
  name: string;
  address: string;
  googleMapsUrl: string;
  blurb: string;
  alt: string;          // default alt text for this building's images
  sortOrder: number;
  hidden?: boolean;     // not rendered anywhere
  comingSoon?: boolean; // card shown, no rooms/room-pages
  rooms: RoomMeta[];    // empty when comingSoon
};

// lib/content/maps.ts
export type MapTarget = {
  address: string;
  googleMapsUrl?: string;
  googleMapsEmbedUrl?: string;
  directionsUrl?: string;
};

const q = (s: string) => encodeURIComponent(s);

/** Link to open the place in Google Maps (explicit override → address fallback). */
export function mapsUrl(t: MapTarget): string {
  return t.googleMapsUrl?.trim() || `https://www.google.com/maps?q=${q(t.address)}`;
}

/** Keyless embeddable map iframe src (explicit override → address fallback). */
export function embedUrl(t: MapTarget): string {
  return t.googleMapsEmbedUrl?.trim() || `https://www.google.com/maps?q=${q(t.address)}&output=embed`;
}

/** Directions link (explicit override → address fallback). */
export function directionsUrl(t: MapTarget): string {
  return t.directionsUrl?.trim() || `https://www.google.com/maps/dir/?api=1&destination=${q(t.address)}`;
}

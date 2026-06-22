import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vĩnh House — Apartments & Hotel Rentals, Da Nang',
    short_name: 'Vĩnh House',
    description:
      'Boutique apartments and hotel rooms in Da Nang. Book direct, pay less, message the owner.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF8ED',
    theme_color: '#0F766E',
    icons: [
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
      { src: '/icon', sizes: '512x512', type: 'image/png' },
    ],
  };
}

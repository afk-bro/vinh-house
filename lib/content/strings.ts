// lib/content/strings.ts
/** All English UI copy. Translate by copying this object per locale later. */
export const t = {
  brand: {
    name: 'Vĩnh House',
    subtitle: 'Apartments and Hotel Rentals — Da Nang',
    footerTagline:
      'Direct booked boutique apartments and hotels in Da Nang. Book direct, pay less, message the owner.',
  },
  nav: {
    buildings: 'Buildings',
    scooterRental: 'Scooter Rental',
    bookNow: 'Book now',
    selectLanguage: 'Select language',
    comingSoon: 'Coming soon',
  },
  booking: { whatsapp: 'WhatsApp', phone: 'Phone', facebook: 'Facebook', email: 'Email' },
  hero: {
    headline: 'Comfortable apartments and hotel rentals in Da Nang',
    tagline: 'Book direct, message the owner, and find your stay with less hassle.',
    viewApartments: 'View apartments',
  },
  valueProps: [
    { title: 'Book direct, pay less', body: 'No platform fees or middlemen — message us directly.' },
    { title: 'Message the owner', body: 'Ask about rooms, prices, and availability before you arrive.' },
    { title: 'Local in Da Nang', body: 'On the ground and ready to help you settle in.' },
  ],
  scooter: {
    title: 'Getting around Da Nang',
    body: 'Rent a scooter and explore the beach, cafés, and city at your own pace.',
    cta: 'Scooter rentals',
  },
  buildings: {
    heading: 'Our buildings',
    comingSoonShort: 'Details coming soon',
    roomType: 'room type',
    roomTypes: 'room types',
    viewRooms: 'View rooms →',
  },
  building: {
    viewOnMaps: 'View on Google Maps →',
    comingSoonTitle: 'Details coming soon',
    comingSoonBody: "We're preparing the listings for this building.",
  },
  room: { available: 'Available', notAvailable: 'Not available' },
  cta: {
    readyToBook: 'Ready to find your room in Da Nang?',
    readyToBookBody: "Message us directly and we'll help you choose the best option.",
  },
} as const;

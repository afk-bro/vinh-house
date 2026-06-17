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
  hero: { browse: 'Browse our buildings' },
  valueProps: [
    { title: 'Book direct, pay less', body: 'No platform fees or middlemen — you deal straight with us.' },
    { title: 'Message the owner directly', body: 'Questions answered by the people who run the buildings.' },
    { title: 'Local, Da Nang–based', body: 'On the ground in Da Nang, ready to help you settle in.' },
  ],
  scooter: {
    title: 'Getting around Da Nang',
    body: 'Rent a scooter and explore the city and coast at your own pace.',
    cta: 'Scooter rentals',
  },
  buildings: {
    heading: 'Our buildings',
    comingSoonShort: 'Details coming soon',
    roomType: 'room type',
    roomTypes: 'room types',
  },
  building: {
    viewOnMaps: 'View on Google Maps →',
    comingSoonTitle: 'Details coming soon',
    comingSoonBody: "We're preparing the listings for this building.",
  },
  room: { available: 'Available', notAvailable: 'Not available' },
  cta: {
    readyToBook: 'Ready to book?',
    readyToBookBody: "Message us directly — we'll help you find the right room.",
  },
} as const;

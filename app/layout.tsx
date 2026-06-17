import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const heading = Cormorant_Garamond({
  subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-heading-loaded',
});
const body = Inter({ subsets: ['latin'], variable: '--font-body-loaded' });

export const metadata: Metadata = {
  title: { default: 'Vĩnh House — Apartments and Hotel Rentals in Da Nang', template: '%s — Vĩnh House Da Nang' },
  description: 'Direct booked boutique apartments and hotels in Da Nang. Book direct, pay less, message the owner.',
  icons: { icon: '/logo.png' },
  openGraph: {
    title: 'Vĩnh House — Apartments and Hotel Rentals in Da Nang',
    description: 'Direct booked boutique apartments and hotels in Da Nang. Book direct, pay less, message the owner.',
    images: ['/hero.jpg'],
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="bg-brand-forest text-text-primary">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

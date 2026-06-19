import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const heading = Fraunces({
  subsets: ['latin'], weight: ['400', '500', '600', '700'], style: ['normal', 'italic'],
  variable: '--font-heading-loaded',
});
const body = Inter({ subsets: ['latin'], variable: '--font-body-loaded' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vinh-house.example'),
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

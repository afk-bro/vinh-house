import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';

const heading = Cormorant_Garamond({
  subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-heading-loaded',
});
const body = Inter({ subsets: ['latin'], variable: '--font-body-loaded' });

export const metadata: Metadata = {
  title: 'PHAP Apartments',
  description: 'Browse apartments across our buildings.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}

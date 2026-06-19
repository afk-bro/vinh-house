import { Cormorant_Garamond, Inter } from 'next/font/google';
import '../globals.css';

const heading = Cormorant_Garamond({
  subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-heading-loaded',
});
const body = Inter({ subsets: ['latin'], variable: '--font-body-loaded' });

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="bg-brand-forest text-text-primary">{children}</body>
    </html>
  );
}

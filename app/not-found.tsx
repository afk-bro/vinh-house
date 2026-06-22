import Link from 'next/link';
import './globals.css';

// Global fallback for paths outside the locale routing (no request locale available, so
// this is English-only and self-contained). Most 404s hit the localized not-found instead.
export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="bg-brand-forest text-text-primary">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
          <p className="font-heading text-7xl text-text-accent">404</p>
          <h1 className="mt-4 font-heading text-3xl text-text-accent">Page not found</h1>
          <p className="mt-3 text-text-secondary">
            The page you&apos;re looking for doesn&apos;t exist or may have moved.
          </p>
          <Link
            href="/"
            className="cta-pill mt-8 inline-flex bg-cta text-text-inverse shadow-md shadow-cta/30 hover:bg-cta-hover hover:shadow-lg"
          >
            Back to home
          </Link>
        </main>
      </body>
    </html>
  );
}

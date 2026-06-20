import { setRequestLocale } from 'next-intl/server';
import Hero from '@/components/Hero';
import ValueProps from '@/components/ValueProps';
import BuildingShowcase from '@/components/BuildingShowcase';
import ScooterBand from '@/components/ScooterBand';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <ValueProps />
      <BuildingShowcase />
      <ScooterBand />
    </>
  );
}


'use client';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import VehicleShowcase from '@/components/VehicleShowcase';
import Features from '@/components/Features';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white" suppressHydrationWarning={true}>
      <Header />
      <Hero />
      <VehicleShowcase />
      <Features />
      <Footer />
    </div>
  );
}


'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ServiceHero from './ServiceHero';
import ServiceOptions from './ServiceOptions';
import AppointmentForm from './AppointmentForm';

export default function ServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ServiceHero />
      <ServiceOptions />
      <AppointmentForm />
      <Footer />
    </div>
  );
}

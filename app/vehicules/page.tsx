
'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VehicleGrid from './VehicleGrid';

export default function VehiculesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <section className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Nos <span className="text-red-600">Véhicules</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez notre gamme complète de scooters et motos électriques VMS. 
              Des modèles conçus pour tous vos besoins de mobilité urbaine.
            </p>
          </div>

          <VehicleGrid />
        </div>
      </section>

      <Footer />
    </div>
  );
}

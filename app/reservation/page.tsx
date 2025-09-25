
'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReservationForm from './ReservationForm';

export default function ReservationPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <section className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Réserver votre <span className="text-red-600">VMS</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choisissez votre véhicule électrique et réservez-le dès maintenant. 
              Notre équipe vous contactera pour finaliser votre commande.
            </p>
          </div>

          <ReservationForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}


'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section 
      className="relative h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://readdy.ai/api/search-image?query=Modern%20electric%20scooter%20and%20motorcycle%20showroom%20with%20sleek%20red%20and%20black%20vehicles%20displayed%20in%20a%20clean%20minimalist%20environment%2C%20professional%20lighting%2C%20contemporary%20urban%20setting%20with%20glass%20surfaces%20and%20modern%20architecture%2C%20high-end%20dealership%20atmosphere&width=1920&height=1080&seq=vms-hero-bg&orientation=landscape')`
      }}
    >
      <div className="container mx-auto px-4 text-center text-white">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Découvrez la Nouvelle
          <br />
          <span className="text-red-500">Génération VMS</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
          Scooters et motos électriques haut de gamme. Performance, style et durabilité réunis.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/vehicules" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors cursor-pointer whitespace-nowrap">
            Voir nos Véhicules
          </Link>
          <Link href="/reservation" className="border-2 border-white hover:bg-white hover:text-gray-900 text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors cursor-pointer whitespace-nowrap">
            Réserver Maintenant
          </Link>
        </div>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';

const vehicles = [
  {
    id: 1,
    name: "VMS Sport 125",
    type: "Scooter",
    price: "3 299",
    description: "Scooter électrique sportif avec autonomie de 80km",
    image: "https://readdy.ai/api/search-image?query=Modern%20red%20electric%20scooter%20VMS%20Sport%20model%20with%20sleek%20aerodynamic%20design%2C%20premium%20finish%2C%20urban%20setting%2C%20clean%20white%20background%2C%20professional%20product%20photography%2C%20high-end%20electric%20motorcycle%20styling&width=600&height=400&seq=vms-scooter-1&orientation=landscape"
  },
  {
    id: 2,
    name: "VMS Urban 250",
    type: "Moto",
    price: "5 499",
    description: "Moto électrique urbaine, parfaite pour la ville",
    image: "https://readdy.ai/api/search-image?query=Elegant%20black%20electric%20motorcycle%20VMS%20Urban%20model%20with%20modern%20urban%20design%2C%20sophisticated%20styling%2C%20clean%20minimalist%20background%2C%20professional%20studio%20lighting%2C%20premium%20electric%20bike%20photography&width=600&height=400&seq=vms-moto-1&orientation=landscape"
  },
  {
    id: 3,
    name: "VMS Cruiser 500",
    type: "Moto",
    price: "7 999",
    description: "Moto électrique longue distance, autonomie 150km",
    image: "https://readdy.ai/api/search-image?query=Premium%20silver%20electric%20motorcycle%20VMS%20Cruiser%20with%20touring%20capabilities%2C%20robust%20design%2C%20professional%20photography%2C%20clean%20background%2C%20high-end%20electric%20motorcycle%20styling%2C%20modern%20aesthetic&width=600&height=400&seq=vms-moto-2&orientation=landscape"
  }
];

export default function VehicleShowcase() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Notre Gamme <span className="text-red-600">VMS</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez nos véhicules électriques dernière génération, alliant performance et respect de l'environnement
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-product-shop>
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-64">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {vehicle.type}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{vehicle.name}</h3>
                <p className="text-gray-600 mb-4">{vehicle.description}</p>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="text-3xl font-bold text-red-600">
                    {vehicle.price} €
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Link href={`/vehicules/${vehicle.id}`} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg text-center font-semibold transition-colors cursor-pointer whitespace-nowrap">
                    Voir Détails
                  </Link>
                  <Link href={`/reservation?model=${vehicle.id}`} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg text-center font-semibold transition-colors cursor-pointer whitespace-nowrap">
                    Réserver
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/vehicules" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors cursor-pointer whitespace-nowrap">
            Voir Tous nos Véhicules
          </Link>
        </div>
      </div>
    </section>
  );
}
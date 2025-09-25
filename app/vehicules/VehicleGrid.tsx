'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { vehicleService, Vehicle } from '../../lib/supabase';

export default function VehicleGrid() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getAll();
      setVehicles(response.vehicles || []);
    } catch (error) {
      console.error('Erreur lors du chargement des véhicules:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Tous', 'Scooter', 'Moto', 'Vélo électrique'];
  
  const filteredVehicles = selectedCategory === 'Tous' 
    ? vehicles 
    : vehicles.filter(vehicle => vehicle.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-2 text-gray-600">Chargement des véhicules...</span>
      </div>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nos <span className="text-red-600">Véhicules</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez notre gamme complète de véhicules électriques. Du scooter urbain à la moto haute performance.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 bg-gray-100 rounded-full p-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:text-red-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-64">
                <img 
                  src={vehicle.image_url} 
                  alt={vehicle.model}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSIyMDAiIHk9IjE1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTNBRiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5JbWFnZSBpbmRpc3BvbmlibGU8L3RleHQ+PC9zdmc+';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {vehicle.category}
                  </span>
                </div>
                {!vehicle.in_stock && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Rupture
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{vehicle.model}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{vehicle.description}</p>
                
                <div className="space-y-2 mb-4">
                  {vehicle.autonomy && (
                    <div className="flex items-center text-sm text-gray-600">
                      <i className="ri-battery-charge-line w-4 h-4 flex items-center justify-center mr-2"></i>
                      {vehicle.autonomy} km d'autonomie
                    </div>
                  )}
                  {vehicle.max_speed && (
                    <div className="flex items-center text-sm text-gray-600">
                      <i className="ri-speed-line w-4 h-4 flex items-center justify-center mr-2"></i>
                      Jusqu'à {vehicle.max_speed} km/h
                    </div>
                  )}
                  {vehicle.charging_time && (
                    <div className="flex items-center text-sm text-gray-600">
                      <i className="ri-time-line w-4 h-4 flex items-center justify-center mr-2"></i>
                      Charge : {vehicle.charging_time}
                    </div>
                  )}
                </div>

                {vehicle.features && vehicle.features.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {vehicle.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {feature}
                      </span>
                    ))}
                    {vehicle.features.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{vehicle.features.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-red-600">{vehicle.price.toFixed(2)} €</p>
                    {vehicle.in_stock && vehicle.stock_quantity > 0 && (
                      <p className="text-sm text-green-600">{vehicle.stock_quantity} en stock</p>
                    )}
                  </div>
                  <Link
                    href={`/vehicules/${vehicle.id}`}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Voir détails
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-motorcycle-line text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun véhicule trouvé</h3>
            <p className="text-gray-500">
              {selectedCategory === 'Tous'
                ? 'Nos véhicules seront bientôt disponibles.'
                : `Aucun véhicule dans la catégorie "${selectedCategory}".`
              }
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
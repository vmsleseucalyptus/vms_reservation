
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { vehicleService, Vehicle } from '@/lib/supabase';

export default function VehicleDetail({ vehicleId }: { vehicleId: string }) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTab, setSelectedTab] = useState('description');

  useEffect(() => {
    loadVehicle();
  }, [vehicleId]);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getAllAdmin();
      const foundVehicle = response.vehicles?.find((v: Vehicle) => v.id === parseInt(vehicleId));
      setVehicle(foundVehicle || null);
    } catch (error) {
      console.error('Erreur lors du chargement du véhicule:', error);
      setVehicle(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-24 pb-20">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du véhicule...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-24 pb-20">
          <div className="container mx-auto px-4 text-center">
            <i className="ri-error-warning-line text-6xl text-red-500 mb-4"></i>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Véhicule non trouvé</h1>
            <p className="text-gray-600 mb-8">Le véhicule que vous recherchez n'existe pas ou n'est plus disponible.</p>
            <Link href="/vehicules" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap">
              Retour aux véhicules
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Images par défaut si pas d'image
  const vehicleImages = vehicle.image_url ? [vehicle.image_url] : [
    'https://readdy.ai/api/search-image?query=modern%20electric%20vehicle%20scooter%20motorcycle%20professional%20product%20photography%20clean%20white%20background%20showcasing%20mobility%20transportation&width=600&height=400&seq=default1&orientation=landscape'
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <section className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 mb-12">
            <div>
              <div className="mb-6">
                <img 
                  src={vehicleImages[selectedImage]}
                  alt={vehicle.model}
                  className="w-full h-96 object-cover object-top rounded-2xl"
                  onError={(e) => {
                    e.currentTarget.src = 'https://readdy.ai/api/search-image?query=modern%20electric%20vehicle%20scooter%20motorcycle%20professional%20product%20photography%20clean%20white%20background%20showcasing%20mobility%20transportation&width=600&height=400&seq=fallback&orientation=landscape';
                  }}
                />
              </div>
              
              {vehicleImages.length > 1 && (
                <div className="flex space-x-4">
                  {vehicleImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer ${
                        selectedImage === index ? 'border-red-600' : 'border-gray-200'
                      }`}
                    >
                      <img 
                        src={image}
                        alt={`${vehicle.model} ${index + 1}`}
                        className="w-full h-full object-cover object-top"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-4">
                <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {vehicle.category}
                </span>
                {!vehicle.in_stock && (
                  <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold ml-2">
                    Rupture de stock
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{vehicle.model}</h1>
              <div className="text-4xl font-bold text-red-600 mb-6">{vehicle.price.toLocaleString()}€</div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {vehicle.autonomy && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{vehicle.autonomy} km</div>
                    <div className="text-sm text-gray-600">Autonomie</div>
                  </div>
                )}
                {vehicle.max_speed && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{vehicle.max_speed} km/h</div>
                    <div className="text-sm text-gray-600">Vitesse max</div>
                  </div>
                )}
                {vehicle.charging_time && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{vehicle.charging_time}</div>
                    <div className="text-sm text-gray-600">Temps de charge</div>
                  </div>
                )}
                {vehicle.stock_quantity > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{vehicle.stock_quantity}</div>
                    <div className="text-sm text-gray-600">En stock</div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-4 mb-8">
                <Link
                  href="/reservation"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-center py-4 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-shopping-cart-line mr-2"></i>
                  Réserver maintenant
                </Link>
                <Link
                  href="/contact"
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-center py-4 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-phone-line mr-2"></i>
                  Nous contacter
                </Link>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  <i className="ri-shield-check-line mr-2"></i>
                  Garanties incluses
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Garantie constructeur 2 ans</li>
                  <li>• Service après-vente VMS</li>
                  <li>• Réseau de maintenance national</li>
                  <li>• Formation à la conduite offerte</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setSelectedTab('description')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    selectedTab === 'description'
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setSelectedTab('features')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    selectedTab === 'features'
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Caractéristiques
                </button>
              </nav>
            </div>

            <div className="p-8">
              {selectedTab === 'description' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">À propos du {vehicle.model}</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {vehicle.description || `Le ${vehicle.model} est un véhicule électrique de haute qualité conçu pour offrir une expérience de conduite exceptionnelle. Avec sa technologie avancée et son design moderne, il représente l'avenir de la mobilité urbaine.`}
                  </p>
                </div>
              )}

              {selectedTab === 'features' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Caractéristiques principales</h3>
                  {vehicle.features && vehicle.features.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {vehicle.features.map((feature, index) => (
                        <div key={index} className="flex items-center bg-gray-50 rounded-lg p-4">
                          <i className="ri-check-line text-green-600 text-xl mr-3"></i>
                          <span className="text-gray-800 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center bg-gray-50 rounded-lg p-4">
                        <i className="ri-check-line text-green-600 text-xl mr-3"></i>
                        <span className="text-gray-800 font-medium">Moteur électrique haute performance</span>
                      </div>
                      <div className="flex items-center bg-gray-50 rounded-lg p-4">
                        <i className="ri-check-line text-green-600 text-xl mr-3"></i>
                        <span className="text-gray-800 font-medium">Batterie lithium longue durée</span>
                      </div>
                      <div className="flex items-center bg-gray-50 rounded-lg p-4">
                        <i className="ri-check-line text-green-600 text-xl mr-3"></i>
                        <span className="text-gray-800 font-medium">Système de freinage régénératif</span>
                      </div>
                      <div className="flex items-center bg-gray-50 rounded-lg p-4">
                        <i className="ri-check-line text-green-600 text-xl mr-3"></i>
                        <span className="text-gray-800 font-medium">Écran digital multifonction</span>
                      </div>
                      <div className="flex items-center bg-gray-50 rounded-lg p-4">
                        <i className="ri-check-line text-green-600 text-xl mr-3"></i>
                        <span className="text-gray-800 font-medium">Éclairage LED intégral</span>
                      </div>
                      <div className="flex items-center bg-gray-50 rounded-lg p-4">
                        <i className="ri-check-line text-green-600 text-xl mr-3"></i>
                        <span className="text-gray-800 font-medium">Garantie constructeur étendue</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// app/vehicules/[id]/page.tsx
import { vehicleService } from '@/lib/supabase';
import Link from 'next/link';

interface PageProps {
  params: { id: string };
}

export default async function VehiclePage({ params }: PageProps) {
  const { id } = params;
  const vehicle = await vehicleService.getById(id);

  if (!vehicle) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Véhicule introuvable</h1>
        <p className="text-gray-600 mt-2">Vérifiez l’ID ou retournez à la liste.</p>
        <Link
          href="/vehicules"
          className="mt-6 inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Retour aux véhicules
        </Link>
      </div>
    );
  }

  return (
    <section className="py-20 container mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Image principale */}
        <div className="space-y-4">
          <img
            src={vehicle.image_url}
            alt={vehicle.model}
            className="rounded-2xl shadow-xl w-full h-[400px] object-cover object-center"
          />

          {/* Galerie supplémentaire si plusieurs images */}
          {vehicle.gallery && vehicle.gallery.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {vehicle.gallery.map((img: string, index: number) => (
                <img
                  key={index}
                  src={img}
                  alt={`${vehicle.model} ${index + 1}`}
                  className="rounded-xl shadow-md w-full h-32 object-cover hover:scale-105 transition-transform"
                />
              ))}
            </div>
          )}
        </div>

        {/* Infos du véhicule */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{vehicle.model}</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">{vehicle.description}</p>

          {/* Caractéristiques techniques */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {vehicle.autonomy && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <span className="block text-sm text-gray-500">Autonomie</span>
                <span className="text-lg font-semibold text-gray-800">
                  {vehicle.autonomy} km
                </span>
              </div>
            )}
            {vehicle.max_speed && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <span className="block text-sm text-gray-500">Vitesse max</span>
                <span className="text-lg font-semibold text-gray-800">
                  {vehicle.max_speed} km/h
                </span>
              </div>
            )}
            {vehicle.charging_time && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <span className="block text-sm text-gray-500">Temps de charge</span>
                <span className="text-lg font-semibold text-gray-800">
                  {vehicle.charging_time}
                </span>
              </div>
            )}
            {vehicle.category && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <span className="block text-sm text-gray-500">Catégorie</span>
                <span className="text-lg font-semibold text-gray-800">
                  {vehicle.category}
                </span>
              </div>
            )}
          </div>

          {/* Liste des features */}
          {vehicle.features && vehicle.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Points forts :</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {vehicle.features.map((feature: string, i: number) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Prix et stock */}
          <div className="mb-6">
            <p className="text-3xl font-bold text-red-600 mb-2">
              {vehicle.price.toFixed(2)} €
            </p>
            {vehicle.in_stock && vehicle.stock_quantity > 0 ? (
              <p className="text-green-600 font-medium">
                ✅ {vehicle.stock_quantity} en stock
              </p>
            ) : (
              <p className="text-gray-500 font-medium">❌ Rupture de stock</p>
            )}
          </div>

          {/* Boutons d’action */}
          <div className="flex space-x-4">
            <Link
              href="/vehicules"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              ← Retour
            </Link>
            <Link
              href={`/reservation/${vehicle.id}`}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Réserver ce véhicule
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}


'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16" suppressHydrationWarning={true}>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="font-['Pacifico'] text-2xl">VMS</span>
            </Link>
            <p className="text-gray-400 mb-6">
              Leader français de la mobilité électrique. Scooters et motos électriques haut de gamme.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer">
                <i className="ri-facebook-fill text-lg"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer">
                <i className="ri-instagram-line text-lg"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer">
                <i className="ri-youtube-line text-lg"></i>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Véhicules</h3>
            <ul className="space-y-3">
              <li><Link href="/vehicules?type=scooter" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Scooters</Link></li>
              <li><Link href="/vehicules?type=moto" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Motos</Link></li>
              <li><Link href="/vehicules" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Tous les modèles</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-3">
              <li><Link href="/reservation" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Réservation</Link></li>
              <li><Link href="/service" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Service Après-Vente</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-300 hover:text-white cursor-pointer">Accueil</Link></li>
              <li><Link href="/vehicules" className="text-gray-300 hover:text-white cursor-pointer">Véhicules</Link></li>
              <li><Link href="/reservation" className="text-gray-300 hover:text-white cursor-pointer">Réservation</Link></li>
              <li><Link href="/service" className="text-gray-300 hover:text-white cursor-pointer">Service</Link></li>
              <li><Link href="/admin" className="text-gray-300 hover:text-white cursor-pointer">Administration</Link></li>
              <li><Link href="https://readdy.ai/?origin=logo" className="text-gray-300 hover:text-white cursor-pointer">Made with Readdy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 VMS. Tous droits réservés. | Mobilité électrique française.
          </p>
        </div>
      </div>
    </footer>
  );
}

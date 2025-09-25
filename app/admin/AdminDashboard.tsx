
'use client';

import { useState } from 'react';
import VehicleManagement from './VehicleManagement';
import ReservationManagement from './ReservationManagement';
import DeliveryLog from './DeliveryLog';
import PhotoManagement from './PhotoManagement';
import AppointmentManagement from './AppointmentManagement';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('vehicles');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.email === 'admin@vms.com' && loginData.password === 'admin123') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Email ou mot de passe incorrect');
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-admin-line text-2xl text-white"></i>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Administration VMS</h1>
                <p className="text-gray-600">Accès réservé aux administrateurs</p>
              </div>

              <form onSubmit={handleLogin}>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Email</label>
                  <input 
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    required
                    suppressHydrationWarning={true}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Mot de passe</label>
                  <input 
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    required
                    suppressHydrationWarning={true}
                  />
                </div>

                {loginError && (
                  <div className="mb-6 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                    {loginError}
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Se connecter
                </button>
              </form>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 text-center">
                  <strong>Accès démo :</strong><br />
                  Email: admin@vms.com<br />
                  Mot de passe: admin123
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Tableau de Bord <span className="text-red-600">VMS</span>
          </h1>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-logout-line mr-2"></i>
            Déconnexion
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('vehicles')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'vehicles'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="ri-motorcycle-line mr-2"></i>
                Véhicules
              </button>
              <button
                onClick={() => setActiveTab('reservations')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'reservations'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="ri-calendar-line mr-2"></i>
                Réservations
              </button>
              <button
                onClick={() => setActiveTab('deliveries')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'deliveries'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="ri-truck-line mr-2"></i>
                Livraisons
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'appointments'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="ri-calendar-check-line mr-2"></i>
                Rendez-vous
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'photos'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="ri-image-line mr-2"></i>
                Photos
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'vehicles' && <VehicleManagement />}
            {activeTab === 'reservations' && <ReservationManagement />}
            {activeTab === 'deliveries' && <DeliveryLog />}
            {activeTab === 'appointments' && <AppointmentManagement />}
            {activeTab === 'photos' && <PhotoManagement />}
          </div>
        </div>
      </div>
    </section>
  );
}
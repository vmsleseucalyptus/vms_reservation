'use client';

import { useState, useEffect } from 'react';
import { reservationService, vehicleService, Vehicle } from '../../lib/supabase';

export default function ReservationForm() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    telephone: '',
    email: '',
    vehicleModel: '',
    reservationType: '',
    dateRetrait: '',
    notes: ''
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const response = await vehicleService.getAll();
      setVehicles(response.vehicles || []);
    } catch (error) {
      console.error('Erreur lors du chargement des véhicules:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.email || !formData.vehicleModel || !formData.reservationType) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      await reservationService.submit(formData);
      setSuccess(true);
      setFormData({
        clientName: '', telephone: '', email: '', vehicleModel: '', 
        reservationType: '', dateRetrait: '', notes: ''
      });
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      alert('Erreur lors de l\'envoi de la réservation. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-check-line text-2xl text-green-600"></i>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Réservation envoyée !</h3>
        <p className="text-gray-600 mb-6">
          Votre demande de réservation a été transmise avec succès. 
          Notre équipe vous contactera dans les plus brefs délais.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
        >
          Nouvelle réservation
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Formulaire de <span className="text-red-600">Réservation</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nom complet *</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              placeholder="Jean Dupont"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Téléphone</label>
            <input
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({...formData, telephone: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              placeholder="0123456789"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            placeholder="jean.dupont@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Véhicule souhaité *</label>
          <select
            value={formData.vehicleModel}
            onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm pr-8"
            required
          >
            <option value="">Sélectionner un véhicule</option>
            {vehicles.filter(v => v.in_stock).map((vehicle) => (
              <option key={vehicle.id} value={vehicle.model}>
                {vehicle.model} - {vehicle.price.toFixed(2)} €
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Type de réservation *</label>
          <select
            value={formData.reservationType}
            onChange={(e) => setFormData({...formData, reservationType: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm pr-8"
            required
          >
            <option value="">Sélectionner le type</option>
            <option value="Achat comptant">Achat comptant</option>
            <option value="Financement">Financement</option>
            <option value="Leasing">Leasing</option>
            <option value="Essai avant achat">Essai avant achat</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Date de retrait souhaitée</label>
          <input
            type="date"
            value={formData.dateRetrait}
            onChange={(e) => setFormData({...formData, dateRetrait: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Notes / Demandes particulières</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none"
            rows={4}
            placeholder="Informations complémentaires..."
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.notes.length}/500 caractères</p>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Envoi en cours...
              </div>
            ) : (
              'Envoyer ma réservation'
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-red-50 rounded-lg">
        <div className="flex items-start">
          <i className="ri-information-line text-red-600 mt-1 mr-3"></i>
          <div className="text-sm text-red-800">
            <p className="font-semibold mb-1">Important :</p>
            <p>
              Cette réservation n'est pas définitive. Notre équipe vous contactera 
              pour confirmer la disponibilité et finaliser les modalités.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { appointmentService } from '../../lib/supabase';

const vehicleModels = [
  'VMS Sport 125',
  'VMS Urban 250', 
  'VMS Cruiser 500',
  'Autre modèle'
];

const serviceTypes = [
  'Maintenance Préventive',
  'Service Batterie',
  'Réparation',
  'Mise à Jour',
  'Diagnostic',
  'Intervention d\'urgence'
];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30'
];

export default function AppointmentForm() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    modele: '',
    typeService: '',
    dateRdv: '',
    heureRdv: '',
    problemeDescription: '',
    numeroSerie: '',
    urgence: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Enregistrer dans Supabase
      await appointmentService.create({
        client_name: `${formData.prenom} ${formData.nom}`,
        telephone: formData.telephone,
        email: formData.email,
        appointment_type: formData.urgence ? 'Urgence' : 'Standard',
        date_appointment: formData.dateRdv,
        time_appointment: formData.heureRdv,
        service_type: formData.typeService,
        vehicle_model: formData.modele,
        status: 'Programmé',
        notes: `${formData.problemeDescription}${formData.numeroSerie ? ` - N° série: ${formData.numeroSerie}` : ''}`
      });

      setSubmitStatus('Votre demande de rendez-vous a été enregistrée avec succès ! Nous vous contacterons sous 24h.');
      setFormData({
        nom: '', prenom: '', telephone: '', email: '', modele: '', typeService: '',
        dateRdv: '', heureRdv: '', problemeDescription: '', numeroSerie: '', urgence: false
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      setSubmitStatus('Erreur lors de l\'enregistrement. Veuillez réessayer.');
    }

    setIsSubmitting(false);
  };

  return (
    <section id="appointment-form" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Prendre <span className="text-red-600">Rendez-vous</span>
            </h2>
            <p className="text-xl text-gray-600">
              Réservez votre créneau pour l'entretien de votre véhicule VMS
            </p>
          </div>

          <div className="bg-gray-50 rounded-3xl p-8">
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Nom *</label>
                  <input 
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Prénom *</label>
                  <input 
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Téléphone *</label>
                  <input 
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email *</label>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Modèle de véhicule *</label>
                  <select 
                    name="modele"
                    value={formData.modele}
                    onChange={(e) => setFormData({...formData, modele: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm pr-8"
                    required
                  >
                    <option value="">Sélectionnez votre modèle</option>
                    {vehicleModels.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Type de service *</label>
                  <select 
                    name="typeService"
                    value={formData.typeService}
                    onChange={(e) => setFormData({...formData, typeService: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm pr-8"
                    required
                  >
                    <option value="">Sélectionnez le service</option>
                    {serviceTypes.map((service) => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Date souhaitée *</label>
                  <input 
                    type="date"
                    name="dateRdv"
                    value={formData.dateRdv}
                    onChange={(e) => setFormData({...formData, dateRdv: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Heure préférée *</label>
                  <select 
                    name="heureRdv"
                    value={formData.heureRdv}
                    onChange={(e) => setFormData({...formData, heureRdv: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm pr-8"
                    required
                  >
                    <option value="">Sélectionnez l'heure</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Numéro de série du véhicule</label>
                <input 
                  type="text"
                  name="numeroSerie"
                  value={formData.numeroSerie}
                  onChange={(e) => setFormData({...formData, numeroSerie: e.target.value})}
                  placeholder="Si vous le connaissez"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Description du problème ou demande</label>
                <textarea 
                  name="problemeDescription"
                  value={formData.problemeDescription}
                  onChange={(e) => setFormData({...formData, problemeDescription: e.target.value})}
                  placeholder="Décrivez votre demande ou le problème rencontré..."
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none"
                ></textarea>
                <div className="text-right text-sm text-gray-500 mt-1">
                  {formData.problemeDescription.length}/500 caractères
                </div>
              </div>

              <div className="mb-8">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    name="urgence"
                    checked={formData.urgence}
                    onChange={(e) => setFormData({...formData, urgence: e.target.checked})}
                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                  />
                  <span className="ml-3 text-gray-700">
                    <span className="font-semibold">Intervention urgente</span> - Besoin d'un rendez-vous dans les 24h
                  </span>
                </label>
              </div>

              <div className="text-center">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-12 py-4 rounded-full text-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isSubmitting ? 'Enregistrement en cours...' : 'Confirmer le Rendez-vous'}
                </button>
              </div>

              {submitStatus && (
                <div className={`mt-6 p-4 rounded-lg text-center ${
                  submitStatus.includes('succès') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {submitStatus}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

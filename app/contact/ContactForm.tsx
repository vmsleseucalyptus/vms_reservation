
'use client';

import { useState } from 'react';

const contactSubjects = [
  'Demande d\'information générale',
  'Demande de devis personnalisé',
  'Support technique',
  'Service après-vente',
  'Réclamation',
  'Partenariat commercial',
  'Autre'
];

export default function ContactForm() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    entreprise: '',
    sujet: '',
    message: '',
    urgence: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://readdy.ai/api/form/d30o9vivrfupcr1quta0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          telephone: formData.telephone,
          entreprise: formData.entreprise,
          sujet: formData.sujet,
          message: formData.message,
          urgence: formData.urgence ? 'Oui' : 'Non'
        }).toString()
      });

      if (response.ok) {
        setSubmitStatus('Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
        setFormData({
          nom: '', prenom: '', email: '', telephone: '', entreprise: '', sujet: '', message: '', urgence: false
        });
      } else {
        setSubmitStatus('Erreur lors de l\'envoi. Veuillez réessayer.');
      }
    } catch (error) {
      setSubmitStatus('Erreur lors de l\'envoi. Veuillez réessayer.');
    }

    setIsSubmitting(false);
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Envoyez-nous un <span className="text-red-600">Message</span>
            </h2>
            <p className="text-xl text-gray-600">
              Notre équipe vous répondra dans les plus brefs délais
            </p>
          </div>

          <div className="bg-gray-50 rounded-3xl p-8">
            <form onSubmit={handleSubmit} data-readdy-form id="contact-vms">
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
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Téléphone</label>
                  <input 
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Entreprise (optionnel)</label>
                  <input 
                    type="text"
                    name="entreprise"
                    value={formData.entreprise}
                    onChange={(e) => setFormData({...formData, entreprise: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Sujet *</label>
                  <select 
                    name="sujet"
                    value={formData.sujet}
                    onChange={(e) => setFormData({...formData, sujet: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm pr-8"
                    required
                  >
                    <option value="">Sélectionnez un sujet</option>
                    {contactSubjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Message *</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Décrivez votre demande en détail..."
                  maxLength={500}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none"
                  required
                ></textarea>
                <div className="text-right text-sm text-gray-500 mt-1">
                  {formData.message.length}/500 caractères
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
                    <span className="font-semibold">Demande urgente</span> - Nécessite une réponse dans les 24h
                  </span>
                </label>
              </div>

              <div className="text-center">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-12 py-4 rounded-full text-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer le Message'}
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

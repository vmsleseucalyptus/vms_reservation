
'use client';

const services = [
  {
    icon: 'ri-tools-line',
    title: 'Maintenance Préventive',
    description: 'Contrôle complet de votre véhicule selon le planning constructeur',
    duration: '1h30',
    price: '89€',
    includes: ['Vérification batterie', 'Contrôle freins', 'Mise à jour logiciel', 'Diagnostic complet']
  },
  {
    icon: 'ri-battery-line',
    title: 'Service Batterie',
    description: 'Diagnostic et maintenance de la batterie électrique',
    duration: '45min',
    price: '49€',
    includes: ['Test capacité', 'Calibrage BMS', 'Nettoyage connecteurs', 'Rapport détaillé']
  },
  {
    icon: 'ri-settings-line',
    title: 'Réparation',
    description: 'Réparation de tous types de pannes et dysfonctionnements',
    duration: 'Variable',
    price: 'Sur devis',
    includes: ['Diagnostic précis', 'Pièces d\'origine', 'Garantie réparation', 'Test qualité']
  },
  {
    icon: 'ri-refresh-line',
    title: 'Mise à Jour',
    description: 'Mise à jour logicielle et optimisation des performances',
    duration: '30min',
    price: '29€',
    includes: ['Firmware latest', 'Optimisation moteur', 'Nouvelles fonctions', 'Sauvegarde']
  }
];

const garanties = [
  {
    icon: 'ri-shield-check-line',
    title: 'Garantie Constructeur',
    description: 'Service gratuit pendant la période de garantie (2 ans)',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: 'ri-time-line',
    title: 'Intervention Rapide',
    description: 'Rendez-vous sous 48h maximum',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: 'ri-medal-line',
    title: 'Techniciens Certifiés',
    description: 'Équipe formée et certifiée par VMS',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    icon: 'ri-truck-line',
    title: 'Véhicule de Courtoisie',
    description: 'Disponible pour les interventions longues',
    color: 'bg-orange-100 text-orange-600'
  }
];

export default function ServiceOptions() {
  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Nos Services <span className="text-red-600">Professionnels</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une gamme complète de services pour maintenir votre véhicule VMS au top de ses performances
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <i className={`${service.icon} text-2xl text-red-600`}></i>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">Durée: {service.duration}</span>
                <span className="text-2xl font-bold text-red-600">{service.price}</span>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Inclus:</h4>
                <ul className="space-y-1">
                  {service.includes.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-center">
                      <i className="ri-check-line text-green-500 mr-2"></i>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-8 mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Nos <span className="text-red-600">Garanties</span>
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {garanties.map((garantie, index) => (
              <div key={index} className="text-center p-6">
                <div className={`w-16 h-16 ${garantie.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <i className={`${garantie.icon} text-2xl`}></i>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{garantie.title}</h4>
                <p className="text-gray-600 text-sm">{garantie.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-3xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">Besoin d'une Intervention d'Urgence ?</h3>
          <p className="text-xl mb-6">Service d'assistance 7j/7 pour les pannes</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:0800123456" className="bg-white text-red-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-phone-line mr-2"></i>
              0800 123 456
            </a>
            <button 
              onClick={() => document.getElementById('appointment-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold hover:bg-white/30 transition-colors cursor-pointer whitespace-nowrap"
            >
              Prendre RDV en Ligne
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

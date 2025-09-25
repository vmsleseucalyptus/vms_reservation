
'use client';

const features = [
  {
    icon: 'ri-flashlight-line',
    title: 'Électrique 100%',
    description: 'Technologie électrique avancée pour une conduite silencieuse et écologique'
  },
  {
    icon: 'ri-shield-check-line',
    title: 'Garantie 2 ans',
    description: 'Garantie complète sur tous nos véhicules avec service après-vente professionnel'
  },
  {
    icon: 'ri-truck-line',
    title: 'Livraison Gratuite',
    description: 'Livraison et installation gratuites dans toute la France métropolitaine'
  },
  {
    icon: 'ri-tools-line',
    title: 'Maintenance Incluse',
    description: 'Service de maintenance préventive inclus la première année'
  }
];

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Pourquoi Choisir <span className="text-red-600">VMS</span> ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une expérience complète pour votre mobilité électrique
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className={`${feature.icon} text-2xl text-red-600`}></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
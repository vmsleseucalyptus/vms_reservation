
'use client';

export default function ServiceHero() {
  return (
    <section 
      className="relative py-32 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://readdy.ai/api/search-image?query=Professional%20motorcycle%20service%20workshop%20with%20modern%20electric%20scooters%20and%20motorcycles%20being%20maintained%20by%20skilled%20technicians%2C%20clean%20organized%20workspace%2C%20advanced%20diagnostic%20equipment%2C%20VMS%20branding%20elements%2C%20professional%20automotive%20service%20environment%20with%20excellent%20lighting&width=1920&height=800&seq=vms-service-hero&orientation=landscape')`
      }}
    >
      <div className="container mx-auto px-4 text-center text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Service Après-Vente <span className="text-red-500">VMS</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Un service professionnel pour maintenir votre véhicule électrique en parfait état
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <button 
            onClick={() => document.getElementById('appointment-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            Prendre RDV
          </button>
          <button 
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            Nos Services
          </button>
        </div>
      </div>
    </section>
  );
}

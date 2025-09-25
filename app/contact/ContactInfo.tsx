
'use client';

export default function ContactInfo() {
  return (
    <section 
      className="relative py-32 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://readdy.ai/api/search-image?query=Modern%20VMS%20electric%20vehicle%20showroom%20and%20service%20center%20exterior%2C%20professional%20automotive%20dealership%20building%20with%20glass%20facade%2C%20VMS%20branding%20signage%2C%20contemporary%20architecture%20with%20clean%20lines%20and%20premium%20appearance&width=1920&height=800&seq=vms-contact-hero&orientation=landscape')`
      }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center text-white mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Contactez <span className="text-red-500">VMS</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Notre équipe d'experts est à votre disposition pour répondre à toutes vos questions
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center text-white">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-map-pin-line text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-4">Adresse</h3>
            <p className="text-white/90">
              123 Avenue de la Mobilité<br />
              75015 Paris, France
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center text-white">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-phone-line text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-4">Téléphone</h3>
            <p className="text-white/90">
              <a href="tel:0145123456" className="hover:text-red-300 transition-colors">01 45 12 34 56</a><br />
              <span className="text-sm">Lundi - Vendredi: 9h-18h</span>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center text-white">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-mail-line text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-4">Email</h3>
            <p className="text-white/90">
              <a href="mailto:contact@vms-electric.com" className="hover:text-red-300 transition-colors">contact@vms-electric.com</a><br />
              <span className="text-sm">Réponse sous 24h</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

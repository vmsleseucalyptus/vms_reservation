
'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from './ContactForm';
import ContactInfo from './ContactInfo';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ContactInfo />
      <ContactForm />
      <Footer />
    </div>
  );
}

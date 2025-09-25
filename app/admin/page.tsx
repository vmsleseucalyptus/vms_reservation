
'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminDashboard from './AdminDashboard';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AdminDashboard />
      <Footer />
    </div>
  );
}

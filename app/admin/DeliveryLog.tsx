
'use client';

import { useState, useEffect } from 'react';
import { deliveryService, Delivery } from '@/lib/supabase';

const deliveryStatus = ['Programmée', 'En cours', 'Livrée', 'Problème', 'Reportée'];

export default function DeliveryLog() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingDelivery, setIsAddingDelivery] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    client_name: '',
    vehicle_model: '',
    date_livraison: '',
    livreur: '',
    adresse: '',
    statut: 'Programmée',
    notes: ''
  });

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await deliveryService.getAll();
      setDeliveries(result.deliveries || []);
    } catch (error) {
      console.error('Erreur lors du chargement des livraisons:', error);
      setError('Erreur lors du chargement des livraisons');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDelivery = async () => {
    if (formData.client_name && formData.vehicle_model && formData.date_livraison) {
      try {
        setError(null);
        await deliveryService.create(formData);
        await loadDeliveries();
        setFormData({
          client_name: '', vehicle_model: '', date_livraison: '', livreur: '', adresse: '', statut: 'Programmée', notes: ''
        });
        setIsAddingDelivery(false);
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la livraison:', error);
        setError('Erreur lors de l\'ajout de la livraison');
      }
    }
  };

  const handleEditDelivery = (id: number) => {
    const delivery = Array.isArray(deliveries) 
      ? deliveries.find(d => d.id === id)
      : undefined;
    if (delivery) {
      setFormData({
        client_name: delivery.client_name,
        vehicle_model: delivery.vehicle_model,
        date_livraison: delivery.date_livraison,
        livreur: delivery.livreur,
        adresse: delivery.adresse,
        statut: delivery.statut,
        notes: delivery.notes
      });
      setEditingDelivery(id);
    }
  };

  const handleUpdateDelivery = async () => {
    if (editingDelivery && formData.client_name && formData.vehicle_model && formData.date_livraison) {
      try {
        setError(null);
        await deliveryService.update(editingDelivery, formData);
        await loadDeliveries();
        setFormData({
          client_name: '', vehicle_model: '', date_livraison: '', livreur: '', adresse: '', statut: 'Programmée', notes: ''
        });
        setEditingDelivery(null);
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la livraison:', error);
        setError('Erreur lors de la mise à jour de la livraison');
      }
    }
  };

  const handleDeleteDelivery = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette livraison ?')) {
      try {
        setError(null);
        await deliveryService.delete(id);
        await loadDeliveries();
      } catch (error) {
        console.error('Erreur lors de la suppression de la livraison:', error);
        setError('Erreur lors de la suppression de la livraison');
      }
    }
  };

  const cancelEdit = () => {
    setFormData({
      client_name: '', vehicle_model: '', date_livraison: '', livreur: '', adresse: '', statut: 'Programmée', notes: ''
    });
    setIsAddingDelivery(false);
    setEditingDelivery(null);
    setError(null);
  };

  const exportDeliveries = () => {
    const safeDeliveries = Array.isArray(deliveries) ? deliveries : [];
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Client,Véhicule,Date,Livreur,Adresse,Statut,Notes\n"
      + safeDeliveries.map(d => 
          `${d.id},"${d.client_name}","${d.vehicle_model}","${d.date_livraison}","${d.livreur}","${d.adresse}","${d.statut}","${d.notes}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `livraisons_vms_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Programmée': 'bg-blue-100 text-blue-800',
      'En cours': 'bg-orange-100 text-orange-800',
      'Livrée': 'bg-green-100 text-green-800',
      'Problème': 'bg-red-100 text-red-800',
      'Reportée': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Journal des Livraisons</h2>
        <div className="flex space-x-4">
          <button
            onClick={exportDeliveries}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-download-line mr-2"></i>
            Exporter CSV
          </button>
          <button
            onClick={() => setIsAddingDelivery(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line mr-2"></i>
            Nouvelle livraison
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <i className="ri-error-warning-line mr-2"></i>
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
        </div>
      )}

      {(isAddingDelivery || editingDelivery) && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {isAddingDelivery ? 'Ajouter une nouvelle livraison' : 'Modifier la livraison'}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Nom du client *</label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="Jean Dupont"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Modèle véhicule *</label>
              <input
                type="text"
                value={formData.vehicle_model}
                onChange={(e) => setFormData({...formData, vehicle_model: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="VMS Sport 125"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Date de livraison *</label>
              <input
                type="date"
                value={formData.date_livraison}
                onChange={(e) => setFormData({...formData, date_livraison: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Livreur</label>
              <input
                type="text"
                value={formData.livreur}
                onChange={(e) => setFormData({...formData, livreur: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="Marc Transport"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Adresse de livraison</label>
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="123 rue de la Paix, Paris"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Statut</label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({...formData, statut: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm pr-8"
              >
                {deliveryStatus.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none"
              rows={3}
              placeholder="Notes sur la livraison..."
              maxLength={500}
            ></textarea>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={isAddingDelivery ? handleAddDelivery : handleUpdateDelivery}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              {isAddingDelivery ? 'Ajouter' : 'Mettre à jour'}
            </button>
            <button
              onClick={cancelEdit}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Véhicule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Livreur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!Array.isArray(deliveries) || deliveries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <i className="ri-truck-line text-4xl mb-4 block"></i>
                    Aucune livraison trouvée
                  </td>
                </tr>
              ) : (
                deliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{delivery.client_name}</div>
                        <div className="text-sm text-gray-500">{delivery.adresse}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{delivery.vehicle_model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(delivery.date_livraison).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{delivery.livreur}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(delivery.statut)}`}>
                        {delivery.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditDelivery(delivery.id)}
                        className="text-blue-600 hover:text-blue-900 cursor-pointer"
                        title="Modifier"
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteDelivery(delivery.id)}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                        title="Supprimer"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-5 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Array.isArray(deliveries) 
              ? deliveries.filter(d => d.statut === 'Programmée').length
              : 0
            }
          </div>
          <div className="text-sm text-blue-800">Programmées</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {Array.isArray(deliveries)
              ? deliveries.filter(d => d.statut === 'En cours').length
              : 0
            }
          </div>
          <div className="text-sm text-orange-800">En cours</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {Array.isArray(deliveries)
              ? deliveries.filter(d => d.statut === 'Livrée').length
              : 0
            }
          </div>
          <div className="text-sm text-green-800">Livrées</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {Array.isArray(deliveries)
              ? deliveries.filter(d => d.statut === 'Problème').length
              : 0
            }
          </div>
          <div className="text-sm text-red-800">Problèmes</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {Array.isArray(deliveries)
              ? deliveries.filter(d => d.statut === 'Reportée').length
              : 0
            }
          </div>
          <div className="text-sm text-yellow-800">Reportées</div>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { reservationService } from '@/lib/supabase';

interface Reservation {
  id: number;
  client_name: string;
  telephone: string;
  email: string;
  vehicle_model: string;
  reservation_type: string;
  date_reservation: string;
  date_retrait: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

const reservationTypes = ['Achat comptant', 'Financement', 'Leasing', 'Essai avant achat'];
const reservationStatus = ['En attente', 'Confirmée', 'En cours', 'Terminée', 'Annulée'];

export default function ReservationManagement() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingReservation, setIsAddingReservation] = useState(false);
  const [editingReservation, setEditingReservation] = useState<number | null>(null);
  const [deletingReservation, setDeletingReservation] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [operationInProgress, setOperationInProgress] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    telephone: '',
    email: '',
    vehicle_model: '',
    reservation_type: '',
    date_reservation: '',
    date_retrait: '',
    status: 'En attente',
    notes: ''
  });

  // New robust useEffect with mounted flag
  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (!mounted) return;
      
      try {
        setLoading(true);
        setError(null);
        const result = await reservationService.getAll();
        
        if (mounted) {
          setReservations(Array.isArray(result.reservations) ? result.reservations : []);
        }
      } catch (error) {
        if (mounted) {
          console.error('Error loading reservations:', error);
          setError('Erreur lors du chargement des réservations. Veuillez actualiser la page.');
          setReservations([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Updated loadReservations (doesn't toggle loading)
  const loadReservations = async () => {
    try {
      setError(null);
      const result = await reservationService.getAll();
      setReservations(Array.isArray(result.reservations) ? result.reservations : []);
    } catch (error) {
      console.error('Error loading reservations:', error);
      setError('Erreur lors du chargement des réservations. Veuillez actualiser la page.');
      setReservations([]);
    }
  };

  const handleAddReservation = async () => {
    if (operationInProgress) return;
    
    if (formData.client_name && formData.email && formData.vehicle_model && formData.reservation_type) {
      try {
        setOperationInProgress(true);
        setError(null);
        
        console.log('Ajout réservation - données envoyées:', formData);
        
        const result = await reservationService.create(formData);
        
        console.log('Ajout réservation - résultat:', result);
        
        await loadReservations();
        setFormData({
          client_name: '', telephone: '', email: '', vehicle_model: '', 
          reservation_type: '', date_reservation: '', date_retrait: '', status: 'En attente', notes: ''
        });
        setIsAddingReservation(false);
      } catch (error) {
        console.error('Error adding reservation:', error);
        setError('Erreur lors de l\'ajout de la réservation. Veuillez réessayer.');
      } finally {
        setOperationInProgress(false);
      }
    }
  };

  const handleEditReservation = (reservation: Reservation) => {
    if (operationInProgress) return;
    
    setFormData({
      client_name: reservation.client_name,
      telephone: reservation.telephone,
      email: reservation.email,
      vehicle_model: reservation.vehicle_model,
      reservation_type: reservation.reservation_type,
      date_reservation: reservation.date_reservation,
      date_retrait: reservation.date_retrait,
      status: reservation.status,
      notes: reservation.notes
    });
    setEditingReservation(reservation.id);
  };

  const handleUpdateReservation = async () => {
    if (operationInProgress || !editingReservation) return;
    
    if (formData.client_name && formData.email && formData.vehicle_model && formData.reservation_type) {
      try {
        setOperationInProgress(true);
        setError(null);
        
        console.log('Mise à jour réservation - ID:', editingReservation);
        console.log('Mise à jour réservation - données envoyées:', formData);
        
        const result = await reservationService.update(editingReservation, formData);
        
        console.log('Mise à jour réservation - résultat:', result);
        
        // Vérifier si la mise à jour a réussi
        if (result && (result.success || result.reservation)) {
          await loadReservations();
          setFormData({
            client_name: '', telephone: '', email: '', vehicle_model: '', 
            reservation_type: '', date_reservation: '', date_retrait: '', status: 'En attente', notes: ''
          });
          setEditingReservation(null);
        } else {
          const errorMsg = result?.error || result?.message || 'Réponse inattendue du serveur';
          console.error('Erreur dans la réponse:', errorMsg);
          setError(`Erreur lors de la mise à jour: ${errorMsg}`);
          // Recharger les données même en cas d'erreur pour voir l'état actuel
          await loadReservations();
        }
        
      } catch (error) {
        console.error('Error updating reservation:', error);
        let errorMessage = 'Erreur lors de la mise à jour de la réservation';
        
        if (error instanceof Error) {
          if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Problème de connexion. Vérifiez votre réseau et réessayez.';
          } else if (error.message.includes('404')) {
            errorMessage = 'Réservation non trouvée. Elle a peut-être été supprimée.';
          } else {
            errorMessage = `Erreur: ${error.message}`;
          }
        }
        
        setError(errorMessage);
        
        // Recharger les données pour voir l'état actuel
        await loadReservations();
        
      } finally {
        setOperationInProgress(false);
      }
    }
  };

  const handleDeleteClick = (reservation: Reservation) => {
    if (operationInProgress) return;
    
    setReservationToDelete(reservation);
    setShowDeleteModal(true);
    setError(null);
  };

  const confirmDelete = async () => {
    if (operationInProgress || !reservationToDelete) return;

    try {
      setOperationInProgress(true);
      setError(null);
      setDeletingReservation(reservationToDelete.id);
      
      // Tentative de suppression avec gestion d'erreur robuste
      const result = await reservationService.delete(reservationToDelete.id);
      
      // Recharger les données uniquement si la suppression a réussi
      if (result && (result.success || result.deleted)) {
        await loadReservations();
        setShowDeleteModal(false);
        setReservationToDelete(null);
      } else {
        throw new Error('Réponse inattendue du serveur');
      }
      
    } catch (error) {
      console.error('Erreur suppression réservation:', error);
      let errorMessage = 'Erreur lors de la suppression';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Problème de connexion. Vérifiez votre réseau et réessayez.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Réservation non trouvée. Elle a peut-être déjà été supprimée.';
        } else {
          errorMessage = `Erreur: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      
      // Recharger les données pour voir l'état actuel
      await loadReservations();
      
    } finally {
      setOperationInProgress(false);
      setDeletingReservation(null);
    }
  };

  const cancelDelete = () => {
    if (operationInProgress) return;
    
    setShowDeleteModal(false);
    setReservationToDelete(null);
    setDeletingReservation(null);
    setError(null);
  };

  const cancelEdit = () => {
    if (operationInProgress) return;
    
    setFormData({
      client_name: '', telephone: '', email: '', vehicle_model: '', 
      reservation_type: '', date_reservation: '', date_retrait: '', status: 'En attente', notes: ''
    });
    setIsAddingReservation(false);
    setEditingReservation(null);
    setError(null);
  };

  const exportReservations = () => {
    if (operationInProgress) return;
    
    const safeReservations = Array.isArray(reservations) ? reservations : [];
    if (safeReservations.length === 0) {
      setError('Aucune donnée à exporter');
      return;
    }
    
    try {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Client,Téléphone,Email,Véhicule,Type,Date Réservation,Date Retrait,Statut,Notes\n"
        + safeReservations.map(r => 
            `${r.id},"${r.client_name}","${r.telephone}","${r.email}","${r.vehicle_model}","${r.reservation_type}","${r.date_reservation}","${r.date_retrait}","${r.status}","${r.notes}"`
          ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `reservations_vms_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur export:', error);
      setError('Erreur lors de l\'export. Veuillez réessayer.');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'En attente': 'bg-yellow-100 text-yellow-800',
      'Confirmée': 'bg-blue-100 text-blue-800',
      'En cours': 'bg-orange-100 text-orange-800',
      'Terminée': 'bg-green-100 text-green-800',
      'Annulée': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPendingReservations = () => {
    return Array.isArray(reservations) 
      ? reservations.filter(r => r.status === 'En attente')
      : [];
  };

  const getConfirmedReservations = () => {
    return Array.isArray(reservations)
      ? reservations.filter(r => r.status === 'Confirmée')
      : [];
  };

  const getCompletedReservations = () => {
    return Array.isArray(reservations)
      ? reservations.filter(r => r.status === 'Terminée')
      : [];
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
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Réservations</h2>
        <div className="flex space-x-4">
          <button
            onClick={exportReservations}
            disabled={operationInProgress}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-download-line mr-2"></i>
            Exporter CSV
          </button>
          <button
            onClick={() => !operationInProgress && setIsAddingReservation(true)}
            disabled={operationInProgress}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line mr-2"></i>
            Nouvelle réservation
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <i className="ri-error-warning-line mr-2"></i>
            <span className="flex-1">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
        </div>
      )}

      {operationInProgress && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <i className="ri-loader-4-line animate-spin mr-2"></i>
            Opération en cours...
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{getPendingReservations().length}</div>
              <div className="text-sm text-yellow-800">En attente</div>
            </div>
            <i className="ri-time-line text-2xl text-yellow-600"></i>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{getConfirmedReservations().length}</div>
              <div className="text-sm text-blue-800">Confirmées</div>
            </div>
            <i className="ri-checkbox-circle-line text-2xl text-blue-600"></i>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{getCompletedReservations().length}</div>
              <div className="text-sm text-green-800">Terminées</div>
            </div>
            <i className="ri-check-double-line text-2xl text-green-600"></i>
          </div>
        </div>
      </div>

      {(isAddingReservation || editingReservation) && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {isAddingReservation ? 'Ajouter une nouvelle réservation' : 'Modifier la réservation'}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Nom du client *</label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                disabled={operationInProgress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm disabled:bg-gray-100"
                placeholder="Jean Dupont"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Téléphone</label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                disabled={operationInProgress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm disabled:bg-gray-100"
                placeholder="06 12 34 56 78"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={operationInProgress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm disabled:bg-gray-100"
                placeholder="jean.dupont@email.com"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Véhicule *</label>
              <input
                type="text"
                value={formData.vehicle_model}
                onChange={(e) => setFormData({...formData, vehicle_model: e.target.value})}
                disabled={operationInProgress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm disabled:bg-gray-100"
                placeholder="VMS Sport 125"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Type de réservation *</label>
              <select
                value={formData.reservation_type}
                onChange={(e) => setFormData({...formData, reservation_type: e.target.value})}
                disabled={operationInProgress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm pr-8 disabled:bg-gray-100"
              >
                <option value="">Sélectionner un type</option>
                {reservationTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                disabled={operationInProgress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm pr-8 disabled:bg-gray-100"
              >
                {reservationStatus.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Date de réservation</label>
              <input
                type="date"
                value={formData.date_reservation}
                onChange={(e) => setFormData({...formData, date_reservation: e.target.value})}
                disabled={operationInProgress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Date de retrait</label>
              <input
                type="date"
                value={formData.date_retrait}
                onChange={(e) => setFormData({...formData, date_retrait: e.target.value})}
                disabled={operationInProgress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              disabled={operationInProgress}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none disabled:bg-gray-100"
              rows={3}
              placeholder="Notes sur la réservation..."
              maxLength={500}
            ></textarea>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={isAddingReservation ? handleAddReservation : handleUpdateReservation}
              disabled={operationInProgress}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              {operationInProgress ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  {isAddingReservation ? 'Ajout...' : 'Mise à jour...'}
                </>
              ) : (
                isAddingReservation ? 'Ajouter' : 'Mettre à jour'
              )}
            </button>
            <button
              onClick={cancelEdit}
              disabled={operationInProgress}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && reservationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <i className="ri-delete-bin-line text-red-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmer la suppression</h3>
                <p className="text-sm text-gray-600">Cette action est irréversible</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Êtes-vous sûr de vouloir supprimer la réservation de{' '}
                <span className="font-semibold">{reservationToDelete.client_name}</span>
                {' '}pour le véhicule{' '}
                <span className="font-semibold">{reservationToDelete.vehicle_model}</span> ?
              </p>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors cursor-pointer"
                disabled={operationInProgress}
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={operationInProgress}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                {operationInProgress ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Suppression...
                  </>
                ) : (
                  'Supprimer'
                )}
              </button>
            </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date retrait</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!Array.isArray(reservations) || reservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <i className="ri-bookmark-line text-4xl mb-4 block"></i>
                    {loading ? 'Chargement...' : 'Aucune réservation trouvée'}
                    {!loading && (
                      <button
                        onClick={loadReservations}
                        className="mt-4 text-red-600 hover:text-red-800 cursor-pointer"
                      >
                        <i className="ri-refresh-line mr-1"></i>
                        Actualiser
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                reservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{reservation.client_name}</div>
                        <div className="text-sm text-gray-500">{reservation.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.vehicle_model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.reservation_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.date_retrait ? new Date(reservation.date_retrait).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditReservation(reservation)}
                        disabled={operationInProgress}
                        className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 cursor-pointer"
                        title="Modifier"
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(reservation)}
                        disabled={operationInProgress}
                        className="text-red-600 hover:text-red-900 disabled:text-gray-400 cursor-pointer"
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
    </div>
  );
}

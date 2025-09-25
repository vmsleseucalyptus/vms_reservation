
'use client';

import { useState, useEffect } from 'react';
import { appointmentService } from '@/lib/supabase';

interface Appointment {
  id: number;
  client_name: string;
  telephone: string;
  email: string;
  appointment_type: string;
  date_appointment: string;
  time_appointment: string;
  service_type: string;
  vehicle_model: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

const appointmentTypes = ['Essai véhicule', 'Livraison', 'Formation', 'Maintenance', 'Consultation', 'Autre'];
const appointmentStatus = ['Programmé', 'Confirmé', 'En cours', 'Terminé', 'Annulé', 'Reporté'];

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<number | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [operationInProgress, setOperationInProgress] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    telephone: '',
    email: '',
    appointment_type: '',
    date_appointment: '',
    time_appointment: '',
    service_type: '',
    vehicle_model: '',
    status: 'Programmé',
    notes: ''
  });

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (!mounted) return;
      
      try {
        setLoading(true);
        setError(null);
        const result = await appointmentService.getAll();
        
        if (mounted) {
          setAppointments(Array.isArray(result.appointments) ? result.appointments : []);
        }
      } catch (error) {
        if (mounted) {
          setError('Erreur de chargement. Veuillez actualiser.');
          setAppointments([]);
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

  const loadAppointments = async () => {
    try {
      setError(null);
      const result = await appointmentService.getAll();
      setAppointments(Array.isArray(result.appointments) ? result.appointments : []);
    } catch (error) {
      setError('Erreur de chargement. Veuillez actualiser.');
      setAppointments([]);
    }
  };

  const handleAddAppointment = async () => {
    if (operationInProgress) return;
    
    if (formData.client_name && formData.appointment_type && formData.date_appointment && formData.time_appointment) {
      try {
        setOperationInProgress(true);
        setError(null);
        await appointmentService.create(formData);
        await loadAppointments();
        setFormData({
          client_name: '', telephone: '', email: '', appointment_type: '', date_appointment: '', 
          time_appointment: '', service_type: '', vehicle_model: '', status: 'Programmé', notes: ''
        });
        setIsAddingAppointment(false);
      } catch (error) {
        setError('Erreur lors de l\'ajout. Veuillez réessayer.');
      } finally {
        setOperationInProgress(false);
      }
    } else {
      setError('Veuillez remplir tous les champs obligatoires.');
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    if (operationInProgress) return;
    
    setFormData({
      client_name: appointment.client_name,
      telephone: appointment.telephone,
      email: appointment.email,
      appointment_type: appointment.appointment_type,
      date_appointment: appointment.date_appointment,
      time_appointment: appointment.time_appointment,
      service_type: appointment.service_type,
      vehicle_model: appointment.vehicle_model,
      status: appointment.status,
      notes: appointment.notes
    });
    setEditingAppointment(appointment.id);
    setError(null);
  };

  const handleUpdateAppointment = async () => {
    if (operationInProgress || !editingAppointment) return;
    
    if (!formData.client_name || !formData.appointment_type || !formData.date_appointment || !formData.time_appointment) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    
    try {
      setOperationInProgress(true);
      setError(null);
      
      console.log('Début de la mise à jour, ID:', editingAppointment);
      console.log('Données du formulaire:', formData);
      
      const result = await appointmentService.update(editingAppointment, formData);
      
      console.log('Résultat complet de la mise à jour:', result);
      
      // Vérification améliorée de la réponse
      if (result) {
        console.log('Mise à jour réussie, rechargement des données...');
        
        // Recharger les données depuis le serveur
        await loadAppointments();
        
        // Réinitialiser le formulaire
        setFormData({
          client_name: '', telephone: '', email: '', appointment_type: '', date_appointment: '', 
          time_appointment: '', service_type: '', vehicle_model: '', status: 'Programmé', notes: ''
        });
        setEditingAppointment(null);
        
        console.log('Formulaire réinitialisé avec succès');
      } else {
        console.error('Résultat inattendu:', result);
        throw new Error('Réponse invalide du serveur');
      }
      
    } catch (error) {
      console.error('Erreur complète lors de la mise à jour:', error);
      
      let errorMessage = 'Erreur de mise à jour';
      
      if (error instanceof Error) {
        if (error.message.includes('connexion') || error.message.includes('réseau')) {
          errorMessage = 'Problème de connexion. Vérifiez votre réseau.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Rendez-vous introuvable.';
        } else if (error.message.includes('timeout') || error.message.includes('délai')) {
          errorMessage = 'Délai dépassé. Réessayez.';
        } else if (error.message.includes('obligatoires')) {
          errorMessage = 'Champs obligatoires manquants.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      
      // En cas d'erreur, recharger quand même les données pour s'assurer de la cohérence
      try {
        await loadAppointments();
      } catch (reloadError) {
        console.error('Erreur lors du rechargement après échec:', reloadError);
      }
      
    } finally {
      setOperationInProgress(false);
    }
  };

  const handleDeleteClick = (appointment: Appointment) => {
    if (operationInProgress) return;
    
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
    setError(null);
  };

  const confirmDelete = async () => {
    if (operationInProgress || !appointmentToDelete) return;

    try {
      setOperationInProgress(true);
      setError(null);
      setDeletingAppointment(appointmentToDelete.id);
      
      const result = await appointmentService.delete(appointmentToDelete.id);
      
      if (result?.success || result?.deleted) {
        await loadAppointments();
        setShowDeleteModal(false);
        setAppointmentToDelete(null);
      } else {
        throw new Error('Échec de la suppression');
      }
      
    } catch (error) {
      let errorMessage = 'Erreur de suppression';
      
      if (error instanceof Error) {
        if (error.message.includes('connexion') || error.message.includes('réseau')) {
          errorMessage = 'Problème de connexion. Réessayez.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Rendez-vous déjà supprimé.';
        }
      }
      
      setError(errorMessage);
      await loadAppointments();
      
    } finally {
      setOperationInProgress(false);
      setDeletingAppointment(null);
    }
  };

  const cancelDelete = () => {
    if (operationInProgress) return;
    
    setShowDeleteModal(false);
    setAppointmentToDelete(null);
    setDeletingAppointment(null);
    setError(null);
  };

  const cancelEdit = () => {
    if (operationInProgress) return;
    
    setFormData({
      client_name: '', telephone: '', email: '', appointment_type: '', date_appointment: '', 
      time_appointment: '', service_type: '', vehicle_model: '', status: 'Programmé', notes: ''
    });
    setIsAddingAppointment(false);
    setEditingAppointment(null);
    setError(null);
  };

  const exportAppointments = () => {
    if (operationInProgress) return;
    
    const safeAppointments = Array.isArray(appointments) ? appointments : [];
    if (safeAppointments.length === 0) {
      setError('Aucune donnée à exporter');
      return;
    }
    
    try {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Client,Téléphone,Email,Type,Date,Heure,Service,Véhicule,Statut,Notes\n"
        + safeAppointments.map(a => 
            `${a.id},"${a.client_name}","${a.telephone}","${a.email}","${a.appointment_type}","${a.date_appointment}","${a.time_appointment}","${a.service_type}","${a.vehicle_model}","${a.status}","${a.notes}"`
          ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `rendez-vous_vms_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setError('Erreur lors de l\'export.');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Programmé': 'bg-blue-100 text-blue-800',
      'Confirmé': 'bg-green-100 text-green-800',
      'En cours': 'bg-orange-100 text-orange-800',
      'Terminé': 'bg-gray-100 text-gray-800',
      'Annulé': 'bg-red-100 text-red-800',
      'Reporté': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return Array.isArray(appointments) 
      ? appointments.filter(a => a.date_appointment === today)
      : [];
  };

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return Array.isArray(appointments)
      ? appointments.filter(a => a.date_appointment > today && a.status !== 'Annulé')
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
        <h2 className="text-2xl font-bold text-gray-900">Journal des Rendez-vous</h2>
        <div className="flex space-x-4">
          <button
            onClick={exportAppointments}
            disabled={operationInProgress}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-download-line mr-2"></i>
            Exporter CSV
          </button>
          <button
            onClick={() => !operationInProgress && setIsAddingAppointment(true)}
            disabled={operationInProgress}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line mr-2"></i>
            Nouveau rendez-vous
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
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{getTodayAppointments().length}</div>
              <div className="text-sm text-blue-800">Aujourd'hui</div>
            </div>
            <i className="ri-calendar-today-line text-2xl text-blue-600"></i>
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">{getUpcomingAppointments().length}</div>
              <div className="text-sm text-orange-800">À venir</div>
            </div>
            <i className="ri-calendar-schedule-line text-2xl text-orange-600"></i>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Array.isArray(appointments) ? appointments.filter(a => a.status === 'Terminé').length : 0}
              </div>
              <div className="text-sm text-green-800">Terminés</div>
            </div>
            <i className="ri-checkbox-circle-line text-2xl text-green-600"></i>
          </div>
        </div>
      </div>

      {(isAddingAppointment || editingAppointment) && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {isAddingAppointment ? 'Ajouter un nouveau rendez-vous' : 'Modifier le rendez-vous'}
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
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={operationInProgress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-5 0 focus:border-transparent text-sm disabled:bg-gray-100"
                placeholder="jean.dupont@email.com"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Type de rendez-vous *</label>
              <select
                value={formData.appointment_type}
                onChange={(e) => setFormData({...formData, appointment_type: e.target.value})}
                disabled={operationInProgress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm pr-8 disabled:bg-gray-100"
              >
                <option value="">Sélectionner un type</option>
                {appointmentTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Date *</label>
              <input
                type="date"
                value={formData.date_appointment}
                onChange={(e) => setFormData({...formData, date_appointment: e.target.value})}
                disabled={operationInProgress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Heure *</label>
              <input
                type="time"
                value={formData.time_appointment}
                onChange={(e) => setFormData({...formData, time_appointment: e.target.value})}
                disabled={operationInProgress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Service</label>
              <input
                type="text"
                value={formData.service_type}
                onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                disabled={operationInProgress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm disabled:bg-gray-100"
                placeholder="Type de service"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Véhicule</label>
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
              <label className="block text-gray-700 font-medium mb-2">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                disabled={operationInProgress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm pr-8 disabled:bg-gray-100"
              >
                {appointmentStatus.map((status) => (
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
              disabled={operationInProgress}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none disabled:bg-gray-100"
              rows={3}
              placeholder="Notes sur le rendez-vous..."
              maxLength={500}
            ></textarea>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={isAddingAppointment ? handleAddAppointment : handleUpdateAppointment}
              disabled={operationInProgress}
              className="bg-green-600 hover:bg-green-7 00 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              {operationInProgress ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  {isAddingAppointment ? 'Ajout...' : 'Mise à jour...'}
                </>
              ) : (
                isAddingAppointment ? 'Ajouter' : 'Mettre à jour'
              )}
            </button>
            <button
              onClick={cancelEdit}
              disabled={operationInProgress}
              className="bg-gray-600 hover:bg-gray-7 00 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && appointmentToDelete && (
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
                Êtes-vous sûr de vouloir supprimer le rendez-vous de{' '}
                <span className="font-semibold">{appointmentToDelete.client_name}</span>
                {' '}prévu le{' '}
                <span className="font-semibold">
                  {new Date(appointmentToDelete.date_appointment).toLocaleDateString('fr-FR')}
                </span>
                {' '}à{' '}
                <span className="font-semibold">{appointmentToDelete.time_appointment}</span> ?
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
                className="bg-red-600 hover:bg-red-7 00 disabled:bg-red-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Heure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Véhicule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!Array.isArray(appointments) || appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <i className="ri-calendar-line text-4xl mb-4 block"></i>
                    {loading ? 'Chargement...' : 'Aucun rendez-vous trouvé'}
                    {!loading && (
                      <button
                        onClick={loadAppointments}
                        className="mt-4 text-red-600 hover:text-red-800 cursor-pointer"
                      >
                        <i className="ri-refresh-line mr-1"></i>
                        Actualiser
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{appointment.client_name}</div>
                        <div className="text-sm text-gray-500">{appointment.telephone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.appointment_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(appointment.date_appointment).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm text-gray-500">{appointment.time_appointment}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.vehicle_model}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditAppointment(appointment)}
                        disabled={operationInProgress}
                        className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 cursor-pointer"
                        title="Modifier"
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(appointment)}
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

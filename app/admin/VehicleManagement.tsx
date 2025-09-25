
'use client';

import { useState, useEffect } from 'react';
import { vehicleService, Vehicle } from '../../lib/supabase';

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [operationInProgress, setOperationInProgress] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file' | 'generate'>('url');
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    model: '',
    category: '',
    price: '',
    autonomy: '',
    maxSpeed: '',
    chargingTime: '',
    imageUrl: '',
    description: '',
    features: '',
    inStock: true,
    stockQuantity: ''
  });

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (!mounted) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await vehicleService.getAllAdmin();
        
        if (mounted) {
          setVehicles(response.vehicles || []);
        }
      } catch (error) {
        if (mounted) {
          console.error('Erreur lors du chargement des véhicules:', error);
          setError('Erreur lors du chargement des véhicules');
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

  const loadVehicles = async () => {
    try {
      setError(null);
      const response = await vehicleService.getAllAdmin();
      setVehicles(response.vehicles || []);
    } catch (error) {
      console.error('Erreur lors du chargement des véhicules:', error);
      setError('Erreur lors du chargement des véhicules');
    }
  };

  const validateForm = () => {
    if (!formData.model.trim()) {
      setError('Le modèle est obligatoire');
      return false;
    }
    if (!formData.category) {
      setError('La catégorie est obligatoire');
      return false;
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      setError('Le prix est obligatoire et doit être un nombre valide');
      return false;
    }
    return true;
  };

  // Fonction pour compresser les images base64
  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Redimensionner pour optimiser la taille
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64);
      };
      img.src = base64;
    });
  };

  const handleAddVehicle = async () => {
    if (!validateForm()) return;

    try {
      setError(null);
      setIsUploading(true);
      
      let processedImageUrl = formData.imageUrl;
      
      // Compresser l'image si c'est du base64
      if (formData.imageUrl.startsWith('data:image/')) {
        processedImageUrl = await compressImage(formData.imageUrl);
      }

      const vehicleData = {
        model: formData.model.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        autonomy: formData.autonomy ? parseInt(formData.autonomy) : null,
        max_speed: formData.maxSpeed ? parseInt(formData.maxSpeed) : null,
        charging_time: formData.chargingTime.trim() || null,
        image_url: processedImageUrl || null,  
        description: formData.description.trim() || null,
        features: formData.features ? formData.features.split(',').map(f => f.trim()).filter(f => f) : [],
        in_stock: formData.inStock,
        stock_quantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : 0
      };

      await vehicleService.create(vehicleData);
      await loadVehicles();
      resetForm();
      setIsAddingVehicle(false);
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du véhicule:', error);
      setError(`Erreur lors de l'ajout du véhicule: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditVehicle = (vehicleOrId: Vehicle | number) => {
    const vehicle = typeof vehicleOrId === 'number'
      ? vehicles.find(v => v.id === vehicleOrId)
      : vehicleOrId;

    if (!vehicle) {
      setError('Véhicule non trouvé pour l\'édition');
      return;
    }

    setFormData({
      model: vehicle.model || '',
      category: vehicle.category || '',
      price: vehicle.price?.toString() || '',
      autonomy: vehicle.autonomy?.toString() || '',
      maxSpeed: vehicle.max_speed?.toString() || '',
      chargingTime: vehicle.charging_time || '',
      imageUrl: vehicle.image_url || '',
      description: vehicle.description || '',
      features: Array.isArray(vehicle.features) ? vehicle.features.join(', ') : '',
      inStock: vehicle.in_stock ?? true,
      stockQuantity: vehicle.stock_quantity?.toString() || '0'
    });
    setEditingVehicle(vehicle.id as number);
    setError(null);
  };

  const handleUpdateVehicle = async () => {
    if (!editingVehicle || !validateForm()) return;

    try {
      setError(null);
      setIsUpdating(true);
      
      let processedImageUrl = formData.imageUrl;
      
      // Compresser l'image si c'est du base64
      if (formData.imageUrl.startsWith('data:image/')) {
        processedImageUrl = await compressImage(formData.imageUrl);
      }

      const vehicleData = {
        model: formData.model.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        autonomy: formData.autonomy ? parseInt(formData.autonomy) : null,
        max_speed: formData.maxSpeed ? parseInt(formData.maxSpeed) : null,
        charging_time: formData.chargingTime.trim() || null,
        image_url: processedImageUrl || null,
        description: formData.description.trim() || null,
        features: formData.features ? formData.features.split(',').map(f => f.trim()).filter(f => f) : [],
        in_stock: formData.inStock,
        stock_quantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : 0
      };

      await vehicleService.update(editingVehicle, vehicleData);
      await loadVehicles();
      resetForm();
      setEditingVehicle(null);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du véhicule:', error);
      setError(`Erreur lors de la mise à jour du véhicule: ${error.message || 'Erreur de connexion'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (vehicleId: number) => {
    if (operationInProgress) return;
    
    if (!vehicleId || vehicleId <= 0) {
      setError('ID de véhicule invalide - impossible de supprimer');
      return;
    }
    
    console.log('Sélection véhicule pour suppression, ID:', vehicleId);
    setSelectedVehicleId(vehicleId);
    setShowDeleteModal(true);
    setError(null);
  };

  const confirmDelete = async () => {
    if (operationInProgress) return;

    if (!selectedVehicleId || selectedVehicleId <= 0) {
      console.error('Erreur: aucun ID de véhicule sélectionné ou ID invalide:', selectedVehicleId);
      setError('Aucun véhicule sélectionné pour suppression');
      setShowDeleteModal(false);
      setSelectedVehicleId(null);
      return;
    }

    try {
      setOperationInProgress(true);
      setError(null);
      setDeletingVehicle(selectedVehicleId);
      
      console.log('🔴 SUPPRESSION - ID véhicule sélectionné:', selectedVehicleId);
      console.log('🔴 SUPPRESSION - Type ID:', typeof selectedVehicleId);
      
      // Vérifier que le véhicule existe encore dans la liste
      const vehicleToDelete = vehicles.find(v => v.id === selectedVehicleId);
      if (!vehicleToDelete) {
        throw new Error('Véhicule non trouvé dans la liste actuelle');
      }
      
      console.log('🔴 SUPPRESSION - Véhicule trouvé:', vehicleToDelete.model);
      
      const result = await vehicleService.delete(selectedVehicleId);
      
      console.log('🔴 SUPPRESSION - Résultat service:', result);
      
      if (result && (result.success || result.deleted)) {
        console.log('✅ SUPPRESSION - Véhicule supprimé avec succès:', selectedVehicleId);
        await loadVehicles(); // Recharger la liste
        setShowDeleteModal(false);
        setSelectedVehicleId(null);
      } else {
        console.error('❌ SUPPRESSION - Réponse inattendue:', result);
        throw new Error(result?.error || 'Échec de la suppression - réponse inattendue');
      }
    } catch (error: any) {
      let errorMessage = 'Erreur de suppression';
      
      console.error('❌ SUPPRESSION - Erreur complète:', error);
      
      if (error.message) {
        if (error.message.includes('connexion') || error.message.includes('réseau') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Problème de connexion. Réessayez.';
        } else if (error.message.includes('404') || error.message.includes('non trouvé')) {
          errorMessage = 'Véhicule déjà supprimé ou non trouvé.';
        } else if (error.message.includes('timeout') || error.message.includes('délai')) {
          errorMessage = 'Délai d\'attente dépassé. Réessayez.';
        } else {
          errorMessage = error.message;
        }
      }
      
      console.error('❌ SUPPRESSION - Message erreur final:', errorMessage);
      setError(errorMessage);
      
      // Toujours recharger les données pour voir l'état actuel
      try {
        await loadVehicles();
      } catch (loadError) {
        console.error('Erreur rechargement après suppression échouée:', loadError);
      }
    } finally {
      setOperationInProgress(false);
      setDeletingVehicle(null);
    }
  };

  const cancelDelete = () => {
    if (operationInProgress) return;
    
    console.log('Annulation suppression véhicule ID:', selectedVehicleId);
    setShowDeleteModal(false);
    setSelectedVehicleId(null);
    setDeletingVehicle(null);
    setError(null);
  };

  const resetForm = () => {
    setFormData({
      model: '',
      category: '',
      price: '',
      autonomy: '',
      maxSpeed: '',
      chargingTime: '',
      imageUrl: '',
      description: '',
      features: '',
      inStock: true,
      stockQuantity: ''
    });
    setError(null);
  };

  const cancelEdit = () => {
    resetForm();
    setIsAddingVehicle(false);
    setEditingVehicle(null);
    setUploadMethod('url');
  };

  const generateImageUrl = (prompt: string) => {
    const cleanPrompt = prompt
      .toLowerCase()
      .replace(/[^a-z0-9\\s]/g, '')
      .replace(/\\s+/g, ' ')
      .trim();
    const seq = Math.random().toString(36).substr(2, 9);
    return `https://readdy.ai/api/search-image?query=$%7BencodeURIComponent%28cleanPrompt%29%7D&width=400&height=300&seq=${seq}&orientation=landscape`;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image valide');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier ne peut pas dépasser 5 MB');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        compressAndSetImage(result);
      };
      reader.onerror = () => {
        setError('Erreur lors du téléchargement du fichier');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      setError('Erreur lors du téléchargement du fichier');
      setIsUploading(false);
    }
  };

  const compressAndSetImage = (base64: string) => {
    const img = document.createElement('img');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const maxWidth = 800;
      const maxHeight = 600;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = height * (maxWidth / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = width * (maxHeight / height);
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
      setFormData(prev => ({ ...prev, imageUrl: compressedBase64 }));
      setIsUploading(false);
    };
    img.src = base64;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-red-500', 'bg-red-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-red-500', 'bg-red-50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-red-500', 'bg-red-50');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fakeEvent = { target: { files } } as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(fakeEvent);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-2 text-gray-600">Chargement des véhicules...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Véhicules</h2>
        <button
          onClick={() => setIsAddingVehicle(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line mr-2"></i>
          Ajouter un véhicule
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <i className="ri-error-warning-line mr-2"></i>
            {error}
          </div>
        </div>
      )}

      {(isAddingVehicle || editingVehicle) && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {isAddingVehicle ? 'Ajouter un nouveau véhicule' : 'Modifier le véhicule'}
          </h3>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Modèle *</label>
              <input
                type="text"
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="VMS Sport 125"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Catégorie *</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm pr-8"
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="Scooter">Scooter</option>
                <option value="Moto">Moto</option>
                <option value="Vélo électrique">Vélo électrique</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Prix (€) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="3999.00"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Autonomie (km)</label>
              <input
                type="number"
                value={formData.autonomy}
                onChange={e => setFormData({ ...formData, autonomy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" 
                placeholder="80"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Vitesse max (km/h)</label>
              <input
                type="number"
                value={formData.maxSpeed}
                onChange={e => setFormData({ ...formData, maxSpeed: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" 
                placeholder="45"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Temps de charge</label>
              <input
                type="text"
                value={formData.chargingTime}
                onChange={e => setFormData({ ...formData, chargingTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" 
                placeholder="4-6 heures"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Stock</label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" 
                placeholder="10"
              />
            </div>
          </div>

          {/* Méthode de téléchargement d'image */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">Méthode d'ajout d'image :</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="file"
                  checked={uploadMethod === 'file'}
                  onChange={(e) => setUploadMethod(e.target.value as 'file')}
                  className="mr-2"
                />
                <i className="ri-upload-line mr-1"></i>
                Télécharger depuis PC
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="url"
                  checked={uploadMethod === 'url'}
                  onChange={(e) => setUploadMethod(e.target.value as 'url')}
                  className="mr-2"
                />
                <i className="ri-link mr-1"></i>
                URL externe
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="generate"
                  checked={uploadMethod === 'generate'}
                  onChange={(e) => setUploadMethod(e.target.value as 'generate')}
                  className="mr-2"
                />
                <i className="ri-magic-line mr-1"></i>
                Générer avec IA
              </label>
            </div>
          </div>

          {/* Zone de téléchargement selon la méthode */}
          {uploadMethod === 'file' && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Image du véhicule</label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 hover:border-red-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="mb-4">
                  <i className="ri-upload-cloud-2-line text-4xl text-gray-400 mb-2"></i>
                  <p className="text-gray-600 mb-2">
                    Glissez-déposez votre image ici ou 
                    <label className="text-red-600 hover:text-red-700 cursor-pointer font-medium ml-1">
                      parcourrez vos fichiers
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">
                    Formats supportés : JPG, PNG, GIF, WebP (max 5MB)
                  </p>
                  {isUploading && (
                    <div className="flex items-center justify-center mt-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2 inline-block"></div>
                      <span className="text-sm text-gray-600">Téléchargement...</span>
                    </div>
                  )}
                </div>
                
                {isUploading && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {uploadMethod === 'url' && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Image URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" 
                placeholder="URL de l'image du véhicule"
              />
            </div>
          )}

          {uploadMethod === 'generate' && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Génération automatique d'image</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    if (formData.model && formData.category) {
                      const generatedUrl = generateImageUrl(
                        `Modern electric ${formData.category} ${formData.model} professional studio photography with clean white background minimal design sleek modern vehicle transportation eco-friendly mobility stylish contemporary design high quality commercial product photo`
                      );
                      setFormData({ ...formData, imageUrl: generatedUrl });
                    }
                  }}
                  disabled={!formData.model || !formData.category}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm"
                >
                  <i className="ri-magic-line mr-1"></i>
                  Générer l'image automatiquement
                </button>
                <span className="text-sm text-gray-500 flex items-center">
                  Basé sur le modèle et la catégorie
                </span>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" 
              rows={3}
              placeholder="Description du véhicule..."
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Caractéristiques</label>
            <input
              type="text"
              value={formData.features}
              onChange={e => setFormData({ ...formData, features: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" 
              placeholder="Batterie lithium, Écran LCD, Freins à disque (séparées par des virgules)"
            />
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="inStock"
              checked={formData.inStock}
              onChange={e => setFormData({ ...formData, inStock: e.target.checked })}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="inStock" className="ml-2 text-gray-700 font-medium">
              En stock
            </label>
          </div>

          {formData.imageUrl && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Aperçu de l'image</label>
              <div className="flex items-start space-x-4">
                <img
                  src={formData.imageUrl}
                  alt="Aperçu"
                  className="w-48 h-32 object-cover rounded-lg border border-gray-300"
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                {formData.imageUrl.startsWith('data:') && (
                  <div className="text-sm text-gray-600">
                    <p><strong>Type :</strong> Fichier local</p>
                    <p><strong>Source :</strong> Téléchargé depuis PC</p>
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                      <i className="ri-computer-line mr-1"></i>
                      Local
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={isAddingVehicle ? handleAddVehicle : handleUpdateVehicle}
              disabled={!formData.model || !formData.category || !formData.price || isUploading || isUpdating}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              {(isUploading || isUpdating) && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
              )}
              {isAddingVehicle 
                ? (isUploading ? 'Traitement...' : 'Ajouter') 
                : (isUpdating ? 'Mise à jour...' : 'Mettre à jour')
              }
            </button>
            <button
              onClick={cancelEdit}
              disabled={isUploading || isUpdating}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && selectedVehicleId && (
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
              {(() => {
                const vehicle = vehicles.find(v => v.id === selectedVehicleId);
                return vehicle ? (
                  <>
                    <p className="text-gray-700">
                      Êtes-vous sûr de vouloir supprimer le véhicule{' '}
                      <span className="font-semibold">{vehicle.model}</span>
                      {' '}de la catégorie{' '}
                      <span className="font-semibold">{vehicle.category}</span> ?
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      ID: {vehicle.id} | Prix: {vehicle.price}€
                    </p>
                  </>
                ) : (
                  <p className="text-gray-700">
                    Êtes-vous sûr de vouloir supprimer le véhicule sélectionné ?
                    <span className="text-sm text-gray-500 block mt-1">ID: {selectedVehicleId}</span>
                  </p>
                );
              })()}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Véhicule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!Array.isArray(vehicles) || vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <i className="ri-car-line text-4xl mb-4 block"></i>
                    {loading ? 'Chargement...' : 'Aucun véhicule trouvé'}
                    {!loading && (
                      <button
                        onClick={loadVehicles}
                        className="mt-4 text-red-600 hover:text-red-800 cursor-pointer"
                      >
                        <i className="ri-refresh-line mr-1"></i>
                        Actualiser
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                vehicles
                  .filter(vehicle => vehicle.id && vehicle.id > 0)
                  .map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {vehicle.id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {vehicle.image_url && (
                          <img 
                            className="h-10 w-10 rounded-lg object-cover mr-3" 
                            src={vehicle.image_url} 
                            alt={vehicle.model || 'Véhicule'}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{vehicle.model || 'Modèle non défini'}</div>
                          <div className="text-sm text-gray-500">
                            {vehicle.autonomy ? `${vehicle.autonomy}km` : 'N/A'} | 
                            {vehicle.max_speed ? ` ${vehicle.max_speed}km/h` : ' N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.category || 'Non définie'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {vehicle.price ? `${vehicle.price.toLocaleString()}€` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          vehicle.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {vehicle.in_stock ? 'En stock' : 'Rupture'}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">({vehicle.stock_quantity || 0})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditVehicle(vehicle)}
                          disabled={operationInProgress || !vehicle.id || vehicle.id <= 0}
                          className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 cursor-pointer"
                          title={vehicle.id && vehicle.id > 0 ? "Modifier le véhicule" : "ID invalide - modification impossible"}
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(vehicle.id as number)}
                          disabled={operationInProgress || !vehicle.id || vehicle.id <= 0}
                          className="text-red-600 hover:text-red-900 disabled:text-gray-400 cursor-pointer"
                          title={vehicle.id && vehicle.id > 0 ? "Supprimer le véhicule" : "ID invalide - suppression impossible"}
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
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

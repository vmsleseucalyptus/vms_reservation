
'use client';

import { useState, useEffect } from 'react';
import { photoService, Photo } from '@/lib/supabase';

const categories = ['Toutes', 'Véhicules', 'Services', 'À propos', 'Actualités'];

export default function PhotoManagement() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<number | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
  const [filterCategory, setFilterCategory] = useState('Toutes');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file' | 'generate'>('file');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    url: '',
    alt_text: '',
    description: ''
  });

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await photoService.getAll();
      setPhotos(result.photos || []);
    } catch (error) {
      console.error('Erreur lors du chargement des photos:', error);
      setError('Erreur lors du chargement des photos');
    } finally {
      setLoading(false);
    }
  };

  const filteredPhotos = filterCategory === 'Toutes' 
    ? (Array.isArray(photos) ? photos : [])
    : (Array.isArray(photos) ? photos.filter(photo => photo.category === filterCategory) : []);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setFormData(prev => ({
            ...prev,
            url: result,
            title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
            alt_text: prev.alt_text || file.name.replace(/\.[^/.]+$/, "")
          }));
        };
        reader.readAsDataURL(file);
      }
    });
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleAddPhoto = async () => {
    if (formData.title && formData.category && formData.url) {
      try {
        setError(null);
        const photoData = {
          title: formData.title,
          category: formData.category,
          url: formData.url,
          alt_text: formData.alt_text || formData.title,
          source_type: formData.url.startsWith('data:') ? 'upload' : 'url'
        };
        await photoService.create(photoData);
        await loadPhotos();
        setFormData({ title: '', category: '', url: '', alt_text: '', description: '' });
        setIsAddingPhoto(false);
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la photo:', error);
        setError('Erreur lors de l\'ajout de la photo');
      }
    }
  };

  const handleEditPhoto = (id: number) => {
    const photo = Array.isArray(photos) 
      ? photos.find(p => p.id === id)
      : undefined;
    if (photo) {
      setFormData({
        title: photo.title,
        category: photo.category,
        url: photo.url,
        alt_text: photo.alt_text,
        description: ''
      });
      setEditingPhoto(id);
    }
  };

  const handleUpdatePhoto = async () => {
    if (editingPhoto && formData.title && formData.category && formData.url) {
      try {
        setError(null);
        const photoData = {
          title: formData.title,
          category: formData.category,
          url: formData.url,
          alt_text: formData.alt_text || formData.title
        };
        await photoService.update(editingPhoto, photoData);
        await loadPhotos();
        setFormData({ title: '', category: '', url: '', alt_text: '', description: '' });
        setEditingPhoto(null);
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la photo:', error);
        setError('Erreur lors de la mise à jour de la photo');
      }
    }
  };

  const handleDeletePhoto = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
      try {
        setError(null);
        await photoService.delete(id);
        await loadPhotos();
        setSelectedPhotos(Array.isArray(selectedPhotos) ? selectedPhotos.filter(photoId => photoId !== id) : []);
      } catch (error) {
        console.error('Erreur lors de la suppression de la photo:', error);
        setError('Erreur lors de la suppression de la photo');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (Array.isArray(selectedPhotos) && selectedPhotos.length > 0 && confirm(`Supprimer ${selectedPhotos.length} photo(s) sélectionnée(s) ?`)) {
      try {
        setError(null);
        await photoService.deleteMultiple(selectedPhotos);
        await loadPhotos();
        setSelectedPhotos([]);
      } catch (error) {
        console.error('Erreur lors de la suppression des photos:', error);
        setError('Erreur lors de la suppression des photos');
      }
    }
  };

  const togglePhotoSelection = (id: number) => {
    setSelectedPhotos(prev => 
      Array.isArray(prev)
        ? (prev.includes(id) 
            ? prev.filter(photoId => photoId !== id)
            : [...prev, id])
        : [id]
    );
  };

  const selectAllPhotos = () => {
    const safeSelectedPhotos = Array.isArray(selectedPhotos) ? selectedPhotos : [];
    const safeFilteredPhotos = Array.isArray(filteredPhotos) ? filteredPhotos : [];
    
    if (safeSelectedPhotos.length === safeFilteredPhotos.length) {
      setSelectedPhotos([]);
    } else {
      setSelectedPhotos(safeFilteredPhotos.map(p => p.id));
    }
  };

  const cancelEdit = () => {
    setFormData({ title: '', category: '', url: '', alt_text: '', description: '' });
    setIsAddingPhoto(false);
    setEditingPhoto(null);
    setUploadMethod('file');
    setError(null);
  };

  const generateImageUrl = (prompt: string) => {
    const cleanPrompt = prompt.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    const seq = Math.random().toString(36).substr(2, 9);
    return `https://readdy.ai/api/search-image?query=$%7BencodeURIComponent%28cleanPrompt%29%7D&width=400&height=300&seq=${seq}&orientation=landscape`;
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
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Photos</h2>
        <div className="flex space-x-3">
          {Array.isArray(selectedPhotos) && selectedPhotos.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm"
            >
              <i className="ri-delete-bin-line mr-2"></i>
              Supprimer ({selectedPhotos.length})
            </button>
          )}
          <button
            onClick={() => setIsAddingPhoto(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line mr-2"></i>
            Ajouter une photo
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

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-gray-700 font-medium">Filtrer par catégorie :</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm pr-8"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="selectAll"
            checked={Array.isArray(selectedPhotos) && Array.isArray(filteredPhotos) && selectedPhotos.length === filteredPhotos.length && filteredPhotos.length > 0}
            onChange={selectAllPhotos}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <label htmlFor="selectAll" className="text-sm text-gray-700 cursor-pointer">
            Tout sélectionner
          </label>
        </div>
      </div>

      {(isAddingPhoto || editingPhoto) && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {isAddingPhoto ? 'Ajouter une nouvelle photo' : 'Modifier la photo'}
          </h3>

          {/* Méthode de téléchargement */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">Méthode d'ajout :</label>
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
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Titre *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="Titre de la photo"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Catégorie *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm pr-8"
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="Véhicules">Véhicules</option>
                <option value="Services">Services</option>
                <option value="À propos">À propos</option>
                <option value="Actualités">Actualités</option>
              </select>
            </div>
          </div>

          {/* Zone de téléchargement selon la méthode */}
          {uploadMethod === 'file' && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Télécharger une image *</label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 hover:border-red-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="mb-4">
                  <i className="ri-upload-cloud-2-line text-4xl text-gray-400 mb-2"></i>
                  <p className="text-gray-600 mb-2">
                    Glissez-déposez vos images ici ou 
                    <label className="text-red-600 hover:text-red-700 cursor-pointer font-medium ml-1">
                      parcourez vos fichiers
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">
                    Formats supportés : JPG, PNG, GIF, WebP (max 10MB)
                  </p>
                </div>
              </div>
            </div>
          )}

          {uploadMethod === 'url' && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">URL de l'image *</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          )}

          {uploadMethod === 'generate' && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Description pour génération d'image *</label>
              <div className="flex space-x-2">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none"
                  rows={3}
                  placeholder="Description détaillée pour générer une image (ex: scooter électrique rouge moderne fond blanc professionnel)"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (formData.description) {
                      const generatedUrl = generateImageUrl(formData.description);
                      setFormData({...formData, url: generatedUrl});
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm"
                >
                  <i className="ri-magic-line mr-1"></i>
                  Générer
                </button>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Texte alternatif</label>
            <input
              type="text"
              value={formData.alt_text}
              onChange={(e) => setFormData({...formData, alt_text: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              placeholder="Description de l'image pour l'accessibilité"
            />
          </div>

          {formData.url && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Aperçu</label>
              <div className="flex items-start space-x-4">
                <img 
                  src={formData.url} 
                  alt="Aperçu" 
                  className="w-32 h-24 object-cover rounded-lg border border-gray-300"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9Ijk2IiB2aWV3Qm94PSIwIDAgMTI4IDk2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iOTYiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSI2NCIgeT0iNTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+SW1hZ2UgaW5kaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
                {formData.url.startsWith('data:') && (
                  <div className="text-sm text-gray-600">
                    <p><strong>Type :</strong> Fichier local</p>
                    <p><strong>Source :</strong> Téléchargé depuis PC</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={isAddingPhoto ? handleAddPhoto : handleUpdatePhoto}
              disabled={!formData.title || !formData.category || !formData.url}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              {isAddingPhoto ? 'Ajouter' : 'Mettre à jour'}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.isArray(filteredPhotos) && filteredPhotos.map((photo) => (
          <div key={photo.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative">
              <input
                type="checkbox"
                checked={Array.isArray(selectedPhotos) ? selectedPhotos.includes(photo.id) : false}
                onChange={() => togglePhotoSelection(photo.id)}
                className="absolute top-3 left-3 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 z-10"
              />
              <img 
                src={photo.url} 
                alt={photo.alt_text}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSIyMDAiIHk9IjE1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTNBRiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5JbWFnZSBpbmRpc3BvbmlibGU8L3RleHQ+PC9zdmc+';
                }}
              />
              <div className="absolute top-3 right-3 flex space-x-1">
                <button
                  onClick={() => handleEditPhoto(photo.id)}
                  className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  <i className="ri-edit-line text-sm"></i>
                </button>
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  <i className="ri-delete-bin-line text-sm"></i>
                </button>
              </div>
              {photo.url.startsWith('data:') && (
                <div className="absolute bottom-2 left-2">
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                    <i className="ri-computer-line mr-1"></i>
                    Local
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 truncate">{photo.title}</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {photo.category}
                </span>
                <span className="text-xs text-gray-500">{photo.file_size || '2.0 MB'}</span>
              </div>
              <p className="text-xs text-gray-500">
                Ajouté le {new Date(photo.upload_date || photo.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {(!Array.isArray(filteredPhotos) || filteredPhotos.length === 0) && (
        <div className="text-center py-12">
          <i className="ri-image-line text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune photo trouvée</h3>
          <p className="text-gray-500 mb-4">
            {filterCategory === 'Toutes' 
              ? 'Commencez par ajouter votre première photo.' 
              : `Aucune photo dans la catégorie "${filterCategory}".`
            }
          </p>
          <button
            onClick={() => setIsAddingPhoto(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line mr-2"></i>
            Ajouter une photo
          </button>
        </div>
      )}
    </div>
  );
}

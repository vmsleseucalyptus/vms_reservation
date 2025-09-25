
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour les données
export interface Vehicle {
  id: number
  model: string
  category: string
  price: number
  autonomy: number
  max_speed: number
  charging_time: string
  image_url: string
  description: string
  features: string[]
  in_stock: boolean
  stock_quantity: number
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: number
  client_name: string
  telephone: string
  email: string
  vehicle_model: string
  reservation_type: string
  date_reservation: string
  date_retrait: string
  status: string
  notes: string
  created_at: string
  updated_at: string
}

export interface Photo {
  id: number
  title: string
  category: string
  url: string
  alt_text: string
  upload_date: string
  file_size: string
  source_type: string
  created_at: string
  updated_at: string
}

export interface Article {
  id: number
  title: string
  category: string
  content: string
  excerpt: string
  author: string
  status: string
  publish_date: string
  last_modified: string
  tags: string[]
  featured_image: string
  created_at: string
  updated_at: string
}

export interface Delivery {
  id: number
  client_name: string
  vehicle_model: string
  date_livraison: string
  livreur: string
  adresse: string
  statut: string
  notes: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: number
  client_name: string
  telephone: string
  email: string
  appointment_type: string
  date_appointment: string
  time_appointment: string
  service_type: string
  vehicle_model: string
  status: string
  notes: string
  created_at: string
  updated_at: string
}

// Fonctions d'appel aux Edge Functions
export const callEdgeFunction = async (functionName: string, options: {
  method?: string
  body?: any
  params?: Record<string, string>
} = {}) => {
  const { method = 'GET', body, params } = options

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Configuration Supabase manquante')
  }

  let url = `${supabaseUrl}/functions/v1/${functionName}`

  if (params && method === 'GET') {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  try {
    let requestBody = undefined

    if (body) {
      requestBody = JSON.stringify(body)
    }

    console.log(`[${method}] Appel à ${functionName}:`, { url, body: requestBody })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 secondes timeout

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: requestBody,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log(`[${method}] Réponse ${functionName}:`, { 
      status: response.status, 
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })

    if (!response.ok) {
      let errorText = ''
      try {
        errorText = await response.text()
        console.error(`Erreur API ${response.status}:`, errorText)
      } catch (textError) {
        console.error('Erreur lecture réponse:', textError)
        errorText = `Erreur ${response.status}: ${response.statusText}`
      }
      throw new Error(`Erreur API ${response.status}: ${errorText}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json()
      console.log(`[${method}] Résultat ${functionName}:`, result)
      return result
    } else {
      const text = await response.text()
      console.log(`[${method}] Réponse texte ${functionName}:`, text)
      return { message: text }
    }
    
  } catch (error) {
    console.error(`Erreur lors de l'appel à ${functionName}:`, error)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Délai d\'attente dépassé. Vérifiez votre connexion.')
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('Problème de connexion. Vérifiez votre réseau et l\'URL Supabase.')
      } else {
        throw error
      }
    } else {
      throw new Error(`Erreur lors de l'appel à ${functionName}`)
    }
  }
}

export const vehicleService = {
  getAll: () => callEdgeFunction('get-vehicles'),
  getAllAdmin: async () => {
    try {
      const result = await callEdgeFunction('manage-vehicles')
      
      if (Array.isArray(result)) {
        return { vehicles: result }
      } else if (result?.vehicles) {
        return result
      } else {
        return { vehicles: [] }
      }
    } catch (error) {
      return { vehicles: [] }
    }
  },
  create: (data: Partial<Vehicle>) => callEdgeFunction('manage-vehicles', { method: 'POST', body: data }),
  update: async (id: number, data: Partial<Vehicle>) => {
    try {
      if (!id || isNaN(id) || id <= 0) {
        throw new Error('ID de véhicule invalide')
      }
      
      if (!data.model?.trim() || !data.category?.trim() || 
          data.price === undefined || data.price < 0) {
        throw new Error('Champs obligatoires manquants ou invalides')
      }
      
      const updateData = {
        id: Number(id),
        model: data.model.trim(),
        category: data.category.trim(),
        price: Number(data.price),
        autonomy: data.autonomy ? Number(data.autonomy) : null,
        max_speed: data.max_speed ? Number(data.max_speed) : null,
        charging_time: data.charging_time?.trim() || '',
        image_url: data.image_url?.trim() || '',
        description: data.description?.trim() || '',
        features: Array.isArray(data.features) ? data.features : [],
        in_stock: Boolean(data.in_stock),
        stock_quantity: data.stock_quantity ? Number(data.stock_quantity) : 0
      }
      
      console.log('Données envoyées pour mise à jour véhicule:', updateData)
      
      const result = await callEdgeFunction('manage-vehicles', { 
        method: 'PUT', 
        params: { id: id.toString() }, 
        body: updateData 
      })
      
      console.log('Résultat de la mise à jour véhicule:', result)
      
      if (result && (result.success === true || result.vehicle)) {
        return {
          success: true,
          vehicle: result.vehicle || result,
          message: result.message || 'Mise à jour réussie'
        }
      } else {
        throw new Error(result?.error || 'Échec de la mise à jour')
      }
      
    } catch (error) {
      console.error('Erreur dans vehicleService.update:', error)
      throw error
    }
  },
  delete: async (id: number) => {
    try {
      if (!id || isNaN(id) || id <= 0) {
        throw new Error('ID de véhicule invalide pour suppression')
      }
      
      console.log('🔴 SUPPRESSION - Tentative suppression véhicule ID:', id)
      console.log('🔴 SUPPRESSION - Type de l\'ID:', typeof id)
      
      const result = await callEdgeFunction('manage-vehicles', { 
        method: 'DELETE', 
        params: { id: id.toString() } 
      })
      
      console.log('🔴 SUPPRESSION - Résultat complet:', result)
      
      if (result && (result.success === true || result.deleted === true)) {
        console.log('✅ SUPPRESSION - Véhicule supprimé avec succès')
        return {
          success: true,
          deleted: true,
          message: result.message || 'Véhicule supprimé avec succès',
          id: id
        }
      } else {
        console.error('❌ SUPPRESSION - Réponse inattendue:', result)
        throw new Error(result?.error || 'Réponse de suppression inattendue')
      }
      
    } catch (error) {
      console.error('❌ SUPPRESSION - Erreur dans vehicleService.delete:', error)
      if (error instanceof Error) {
        throw error
      } else {
        throw new Error('Erreur lors de la suppression du véhicule')
      }
    }
  },
}

export const reservationService = {
  getAll: async () => {
    try {
      const result = await callEdgeFunction('manage-reservations')
      
      if (Array.isArray(result)) {
        return { reservations: result }
      } else if (result?.reservations) {
        return result
      } else {
        return { reservations: [] }
      }
    } catch (error) {
      return { reservations: [] }
    }
  },
  create: (data: Partial<Reservation>) => callEdgeFunction('manage-reservations', { method: 'POST', body: data }),
  update: async (id: number, data: Partial<Reservation>) => {
    try {
      if (!id || isNaN(id) || id <= 0) {
        throw new Error('ID de réservation invalide')
      }
      
      if (!data.client_name?.trim() || !data.telephone?.trim() || 
          !data.vehicle_model?.trim() || !data.date_reservation) {
        throw new Error('Champs obligatoires manquants')
      }
      
      const updateData = {
        id: Number(id),
        client_name: data.client_name.trim(),
        telephone: data.telephone.trim(),
        email: data.email?.trim() || '',
        vehicle_model: data.vehicle_model.trim(),
        reservation_type: data.reservation_type?.trim() || 'Standard',
        date_reservation: data.date_reservation,
        date_retrait: data.date_retrait || '',
        status: data.status || 'En attente',
        notes: data.notes?.trim() || ''
      }
      
      console.log('Données envoyées pour mise à jour réservation:', updateData)
      
      const result = await callEdgeFunction('manage-reservations', { 
        method: 'PUT', 
        body: updateData 
      })
      
      console.log('Résultat de la mise à jour réservation:', result)
      
      if (result && (result.success === true || result.reservation)) {
        return {
          success: true,
          reservation: result.reservation || result,
          message: result.message || 'Mise à jour réussie'
        }
      } else {
        throw new Error(result?.error || 'Échec de la mise à jour')
      }
      
    } catch (error) {
      console.error('Erreur dans reservationService.update:', error)
      throw error
    }
  },
  delete: (id: number) => callEdgeFunction('manage-reservations', { method: 'DELETE', body: { id } }),
  submit: (data: any) => callEdgeFunction('submit-reservation', { method: 'POST', body: data }),
}

export const photoService = {
  getAll: async (category?: string) => {
    try {
      const result = await callEdgeFunction('manage-photos', { 
        params: category ? { category } : {} 
      })
      
      if (Array.isArray(result)) {
        return { photos: result }
      } else if (result?.photos) {
        return result
      } else {
        return { photos: [] }
      }
    } catch (error) {
      return { photos: [] }
    }
  },
  create: (data: Partial<Photo>) => callEdgeFunction('manage-photos', { method: 'POST', body: data }),
  update: async (id: number, data: Partial<Photo>) => {
    try {
      if (!id || isNaN(id) || id <= 0) {
        throw new Error('ID de photo invalide')
      }
      
      if (!data.title?.trim() || !data.url?.trim()) {
        throw new Error('Titre et URL sont obligatoires')
      }
      
      const updateData = {
        id: Number(id),
        title: data.title.trim(),
        category: data.category?.trim() || 'Général',
        url: data.url.trim(),
        alt_text: data.alt_text?.trim() || '',
        file_size: data.file_size?.trim() || '',
        source_type: data.source_type?.trim() || 'Upload'
      }
      
      console.log('Données envoyées pour mise à jour photo:', updateData)
      
      const result = await callEdgeFunction('manage-photos', { 
        method: 'PUT', 
        params: { id: id.toString() }, 
        body: updateData 
      })
      
      console.log('Résultat de la mise à jour photo:', result)
      
      if (result && (result.success === true || result.photo)) {
        return {
          success: true,
          photo: result.photo || result,
          message: result.message || 'Mise à jour réussie'
        }
      } else {
        throw new Error(result?.error || 'Échec de la mise à jour')
      }
      
    } catch (error) {
      console.error('Erreur dans photoService.update:', error)
      throw error
    }
  },
  delete: (id: number) => callEdgeFunction('manage-photos', { method: 'DELETE', params: { id: id.toString() } }),
  deleteMultiple: (ids: number[]) => callEdgeFunction('manage-photos', { method: 'DELETE', body: { ids } }),
}

export const articleService = {
  getAll: (status?: string, category?: string) => callEdgeFunction('manage-articles', {
    params: {
      ...(status ? { status } : {}),
      ...(category ? { category } : {})
    }
  }),
  create: (data: Partial<Article>) => callEdgeFunction('manage-articles', { method: 'POST', body: data }),
  update: (id: number, data: Partial<Article>) => callEdgeFunction('manage-articles', { method: 'PUT', params: { id: id.toString() }, body: data }),
  updateMultiple: (ids: number[], newStatus: string) => callEdgeFunction('manage-articles', { method: 'PUT', body: { ids, newStatus } }),
  delete: (id: number) => callEdgeFunction('manage-articles', { method: 'DELETE', params: { id: id.toString() } }),
  deleteMultiple: (ids: number[]) => callEdgeFunction('manage-articles', { method: 'DELETE', body: { ids } }),
}

export const deliveryService = {
  getAll: () => callEdgeFunction('manage-deliveries'),
  create: (data: Partial<Delivery>) => callEdgeFunction('manage-deliveries', { method: 'POST', body: data }),
  update: (id: number, data: Partial<Delivery>) => callEdgeFunction('manage-deliveries', { method: 'PUT', params: { id: id.toString() }, body: data }),
  delete: (id: number) => callEdgeFunction('manage-deliveries', { method: 'DELETE', params: { id: id.toString() } }),
}

// Modified appointmentService
export const appointmentService = {
  getAll: async () => {
    try {
      const result = await callEdgeFunction('manage-appointments')
      
      if (Array.isArray(result)) {
        return { appointments: result }
      } else if (result?.appointments) {
        return result
      } else {
        return { appointments: [] }
      }
    } catch (error) {
      return { appointments: [] }
    }
  },
  create: (data: Partial<Appointment>) => callEdgeFunction('manage-appointments', { method: 'POST', body: data }),
  update: async (id: number, data: Partial<Appointment>) => {
    try {
      // Validation côté client renforcée
      if (!id || isNaN(id) || id <= 0) {
        throw new Error('ID de rendez-vous invalide')
      }
      
      if (!data.client_name?.trim() || !data.appointment_type?.trim() || 
          !data.date_appointment || !data.time_appointment) {
        throw new Error('Champs obligatoires manquants')
      }
      
      const updateData = {
        id: Number(id),
        client_name: data.client_name.trim(),
        telephone: data.telephone?.trim() || '',
        email: data.email?.trim() || '',
        appointment_type: data.appointment_type.trim(),
        date_appointment: data.date_appointment,
        time_appointment: data.time_appointment,
        service_type: data.service_type?.trim() || '',
        vehicle_model: data.vehicle_model?.trim() || '',
        status: data.status || 'Programmé',
        notes: data.notes?.trim() || ''
      }
      
      console.log('Données envoyées pour mise à jour:', updateData)
      
      const result = await callEdgeFunction('manage-appointments', { 
        method: 'PUT', 
        body: updateData 
      })
      
      console.log('Résultat de la mise à jour:', result)
      
      // Vérification robuste de la réponse
      if (result && (result.success === true || result.appointment)) {
        return {
          success: true,
          appointment: result.appointment || result,
          message: result.message || 'Mise à jour réussie'
        }
      } else {
        throw new Error(result?.error || 'Échec de la mise à jour')
      }
      
    } catch (error) {
      console.error('Erreur dans appointmentService.update:', error)
      throw error
    }
  },
  delete: (id: number) => callEdgeFunction('manage-appointments', { method: 'DELETE', body: { id } }),
}

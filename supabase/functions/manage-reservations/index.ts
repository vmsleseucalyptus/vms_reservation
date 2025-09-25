import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const method = req.method

    if (method === 'GET') {
      console.log('GET: Récupération des réservations')
      const { data: reservations, error } = await supabaseClient
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur GET reservations:', error)
        return new Response(JSON.stringify({ 
          error: `Erreur récupération: ${error.message}`,
          reservations: []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      
      console.log(`GET: ${reservations?.length || 0} réservations récupérées`)
      return new Response(JSON.stringify({ reservations: reservations || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'POST') {
      console.log('POST: Création d\'une réservation')
      const reservationData = await req.json()
      console.log('Données reçues POST:', reservationData)
      
      // Validation selon le schéma DB - champs obligatoires
      if (!reservationData.client_name || !reservationData.vehicle_model || 
          !reservationData.reservation_type || !reservationData.date_reservation) {
        return new Response(JSON.stringify({ 
          error: 'Champs obligatoires manquants: client_name, vehicle_model, reservation_type, date_reservation'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 422
        })
      }
      
      // Préparation des données avec validation des types
      const insertData = {
        client_name: String(reservationData.client_name).trim(),
        telephone: reservationData.telephone ? String(reservationData.telephone).trim() : null,
        email: reservationData.email ? String(reservationData.email).trim() : null,
        vehicle_model: String(reservationData.vehicle_model).trim(),
        reservation_type: String(reservationData.reservation_type).trim(),
        date_reservation: reservationData.date_reservation, // Type date
        date_retrait: reservationData.date_retrait || null, // Type date nullable
        status: reservationData.status ? String(reservationData.status).trim() : 'En attente',
        notes: reservationData.notes ? String(reservationData.notes).trim() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('Données préparées pour insertion:', insertData)
      
      const { data: reservation, error } = await supabaseClient
        .from('reservations')
        .insert([insertData])
        .select()
        .single()

      if (error) {
        console.error('Erreur POST reservation:', error)
        return new Response(JSON.stringify({ 
          error: `Erreur création: ${error.message}`,
          details: error
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      
      if (!reservation) {
        return new Response(JSON.stringify({ 
          error: 'Erreur lors de la création - aucune donnée retournée'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        })
      }
      
      console.log('POST: Réservation créée avec succès, ID:', reservation.id)
      return new Response(JSON.stringify({ 
        success: true,
        reservation,
        message: `Réservation de ${reservation.client_name} créée avec succès`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'PUT') {
      let requestData
      
      try {
        const bodyText = await req.text()
        console.log('📝 PUT - Corps reçu:', bodyText)
        
        if (!bodyText?.trim()) {
          return new Response(JSON.stringify({ 
            error: 'Corps de requête vide'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          })
        }
        
        requestData = JSON.parse(bodyText)
        console.log('📝 PUT - Données parsées:', requestData)
      } catch (parseError) {
        console.error('❌ PUT - Erreur parsing:', parseError)
        return new Response(JSON.stringify({ 
          error: `Données JSON invalides: ${parseError.message}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      
      const { id, ...reservationData } = requestData
      console.log('📝 PUT - ID:', id)
      console.log('📝 PUT - Données réservation:', reservationData)
      
      if (!id) {
        return new Response(JSON.stringify({ 
          error: 'ID de réservation manquant pour la mise à jour'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      
      // Conversion ID (integer dans la DB)
      const numericId = parseInt(id)
      if (isNaN(numericId) || numericId <= 0) {
        return new Response(JSON.stringify({ 
          error: `ID invalide: ${id} doit être un nombre entier positif`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      
      // Validation des champs obligatoires
      if (!reservationData.client_name || !reservationData.vehicle_model || 
          !reservationData.reservation_type || !reservationData.date_reservation) {
        return new Response(JSON.stringify({ 
          error: 'Champs obligatoires manquants: client_name, vehicle_model, reservation_type, date_reservation'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 422
        })
      }
      
      // Vérifier que la réservation existe
      const { data: existingReservation, error: checkError } = await supabaseClient
        .from('reservations')
        .select('*')
        .eq('id', numericId)
        .single()

      if (checkError) {
        console.error('❌ PUT - Erreur vérification:', checkError)
        if (checkError.code === 'PGRST116') {
          return new Response(JSON.stringify({ 
            error: `Réservation avec ID ${numericId} non trouvée`
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404
          })
        }
        return new Response(JSON.stringify({ 
          error: `Erreur vérification: ${checkError.message}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      
      console.log('📝 PUT - Réservation existante:', existingReservation.client_name)
      
      // Préparer les données de mise à jour avec validation des types
      const updateData = {
        client_name: String(reservationData.client_name).trim(),
        telephone: reservationData.telephone ? String(reservationData.telephone).trim() : existingReservation.telephone,
        email: reservationData.email ? String(reservationData.email).trim() : existingReservation.email,
        vehicle_model: String(reservationData.vehicle_model).trim(),
        reservation_type: String(reservationData.reservation_type).trim(),
        date_reservation: reservationData.date_reservation,
        date_retrait: reservationData.date_retrait || existingReservation.date_retrait,
        status: reservationData.status ? String(reservationData.status).trim() : existingReservation.status,
        notes: reservationData.notes ? String(reservationData.notes).trim() : existingReservation.notes,
        updated_at: new Date().toISOString()
      }
      
      console.log('📝 PUT - Données à mettre à jour:', updateData)
      
      const { data: reservation, error } = await supabaseClient
        .from('reservations')
        .update(updateData)
        .eq('id', numericId)
        .select()
        .single()

      if (error) {
        console.error('❌ PUT - Erreur mise à jour:', error)
        return new Response(JSON.stringify({ 
          error: `Erreur mise à jour: ${error.message}`,
          details: error
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      
      if (!reservation) {
        console.error('❌ PUT - Aucune donnée retournée')
        return new Response(JSON.stringify({ 
          error: 'Aucune ligne mise à jour - vérifiez l\'ID'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        })
      }
      
      console.log('✅ PUT - Réservation mise à jour:', reservation.client_name)
      
      return new Response(JSON.stringify({ 
        success: true,
        reservation,
        message: `Réservation de ${reservation.client_name} mise à jour avec succès`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'DELETE') {
      console.log('DELETE: Suppression d\'une réservation')
      
      let requestData
      let id
      
      try {
        const body = await req.text()
        console.log('DELETE body brut:', body)
        
        if (body) {
          requestData = JSON.parse(body)
          id = requestData.id
        }
      } catch (parseError) {
        console.log('Erreur parsing JSON, essai avec URL params')
        const url = new URL(req.url)
        const urlId = url.searchParams.get('id')
        if (urlId) {
          id = parseInt(urlId)
        }
      }
      
      console.log('DELETE ID extrait:', id)

      if (!id || isNaN(id) || id <= 0) {
        console.error('ID manquant ou invalide:', id)
        return new Response(JSON.stringify({ 
          error: `ID de réservation invalide: ${id}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      const numericId = parseInt(id)
      
      // Vérifier que la réservation existe
      const { data: existingReservation, error: checkError } = await supabaseClient
        .from('reservations')
        .select('id, client_name')
        .eq('id', numericId)
        .single()

      if (checkError) {
        console.error('Erreur vérification existence:', checkError)
        if (checkError.code === 'PGRST116') {
          return new Response(JSON.stringify({ 
            error: `Réservation avec ID ${numericId} non trouvée`
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404
          })
        }
        return new Response(JSON.stringify({ 
          error: `Erreur vérification: ${checkError.message}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      console.log('Réservation trouvée, suppression en cours...')

      const { data: deletedData, error: deleteError } = await supabaseClient
        .from('reservations')
        .delete()
        .eq('id', numericId)
        .select()

      if (deleteError) {
        console.error('Erreur suppression:', deleteError)
        return new Response(JSON.stringify({ 
          error: `Erreur suppression: ${deleteError.message}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      console.log('DELETE: Réservation supprimée avec succès')
      return new Response(JSON.stringify({ 
        success: true, 
        message: `Réservation de ${existingReservation.client_name} supprimée avec succès`,
        id: numericId,
        deleted: true,
        deletedData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      error: `Méthode ${method} non autorisée`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    console.error('❌ Erreur générale:', error)
    
    return new Response(JSON.stringify({
      error: errorMessage,
      timestamp: new Date().toISOString(),
      method: req.method
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
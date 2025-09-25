import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Variables d\'environnement Supabase manquantes')
      return new Response(JSON.stringify({ 
        error: 'Configuration serveur incomplète'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)
    const method = req.method

    if (method === 'GET') {
      console.log('GET: Récupération des rendez-vous')
      
      const { data: appointments, error } = await supabaseClient
        .from('appointments')
        .select('*')
        .order('date_appointment', { ascending: true })
        .order('time_appointment', { ascending: true })

      if (error) {
        console.error('Erreur GET appointments:', error)
        return new Response(JSON.stringify({ 
          error: `Erreur récupération: ${error.message}`,
          appointments: []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      
      console.log(`GET: ${appointments?.length || 0} rendez-vous récupérés`)
      
      return new Response(JSON.stringify({ appointments: appointments || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'POST') {
      console.log('POST: Création d\'un rendez-vous')
      
      const appointmentData = await req.json()
      console.log('Données reçues POST:', appointmentData)
      
      // Validation des champs obligatoires selon le schéma DB
      if (!appointmentData.client_name || !appointmentData.appointment_type || 
          !appointmentData.date_appointment || !appointmentData.time_appointment) {
        return new Response(JSON.stringify({ 
          error: 'Champs obligatoires manquants: client_name, appointment_type, date_appointment, time_appointment'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 422
        })
      }

      // Préparation des données avec validation des types
      const insertData = {
        client_name: String(appointmentData.client_name).trim(),
        telephone: appointmentData.telephone ? String(appointmentData.telephone).trim() : null,
        email: appointmentData.email ? String(appointmentData.email).trim() : null,
        appointment_type: String(appointmentData.appointment_type).trim(),
        date_appointment: appointmentData.date_appointment, // Type date
        time_appointment: appointmentData.time_appointment, // Type time
        service_type: appointmentData.service_type ? String(appointmentData.service_type).trim() : null,
        vehicle_model: appointmentData.vehicle_model ? String(appointmentData.vehicle_model).trim() : null,
        status: appointmentData.status ? String(appointmentData.status).trim() : 'Programmé',
        notes: appointmentData.notes ? String(appointmentData.notes).trim() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('Données préparées pour insertion:', insertData)
      
      const { data: appointment, error } = await supabaseClient
        .from('appointments')
        .insert([insertData])
        .select()
        .single()

      if (error) {
        console.error('Erreur POST appointment:', error)
        return new Response(JSON.stringify({ 
          error: `Erreur création: ${error.message}`,
          details: error
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      
      if (!appointment) {
        console.error('POST: Aucune donnée retournée après insertion')
        return new Response(JSON.stringify({ 
          error: 'Erreur lors de la création - aucune donnée retournée'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        })
      }
      
      console.log('POST: Rendez-vous créé avec succès, ID:', appointment.id)
      
      return new Response(JSON.stringify({ 
        success: true,
        appointment,
        message: `Rendez-vous de ${appointment.client_name} créé avec succès`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'PUT') {
      console.log('PUT: Mise à jour d\'un rendez-vous')
      
      let requestData
      
      try {
        const bodyText = await req.text()
        console.log('PUT request body raw:', bodyText)
        
        if (!bodyText?.trim()) {
          return new Response(JSON.stringify({ 
            error: 'Corps de requête vide'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          })
        }
        
        requestData = JSON.parse(bodyText)
        console.log('PUT parsed data:', requestData)
      } catch (parseError) {
        console.error('Erreur parsing JSON:', parseError)
        return new Response(JSON.stringify({ 
          error: `Données JSON invalides: ${parseError.message}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      
      const { id, ...appointmentData } = requestData
      
      if (!id) {
        return new Response(JSON.stringify({ 
          error: 'ID de rendez-vous manquant pour la mise à jour'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      
      // Conversion et validation de l'ID (bigint dans la DB)
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
      if (!appointmentData.client_name || !appointmentData.appointment_type || 
          !appointmentData.date_appointment || !appointmentData.time_appointment) {
        return new Response(JSON.stringify({ 
          error: 'Champs obligatoires manquants: client_name, appointment_type, date_appointment, time_appointment'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 422
        })
      }
      
      console.log(`PUT: Mise à jour du rendez-vous ID ${numericId}`)
      
      // Vérifier que l'enregistrement existe
      const { data: existingAppointment, error: checkError } = await supabaseClient
        .from('appointments')
        .select('id, client_name, status')
        .eq('id', numericId)
        .single()

      if (checkError) {
        console.error('Erreur vérification existence:', checkError)
        if (checkError.code === 'PGRST116') {
          return new Response(JSON.stringify({ 
            error: `Rendez-vous avec ID ${numericId} non trouvé`
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
      
      console.log('PUT: Rendez-vous existant trouvé:', existingAppointment.client_name)
      
      // Préparer les données de mise à jour avec validation des types
      const updateData = {
        client_name: String(appointmentData.client_name).trim(),
        telephone: appointmentData.telephone ? String(appointmentData.telephone).trim() : existingAppointment.telephone,
        email: appointmentData.email ? String(appointmentData.email).trim() : existingAppointment.email,
        appointment_type: String(appointmentData.appointment_type).trim(),
        date_appointment: appointmentData.date_appointment, // Type date
        time_appointment: appointmentData.time_appointment, // Type time
        service_type: appointmentData.service_type ? String(appointmentData.service_type).trim() : existingAppointment.service_type,
        vehicle_model: appointmentData.vehicle_model ? String(appointmentData.vehicle_model).trim() : existingAppointment.vehicle_model,
        status: appointmentData.status ? String(appointmentData.status).trim() : existingAppointment.status || 'Programmé',
        notes: appointmentData.notes ? String(appointmentData.notes).trim() : existingAppointment.notes,
        updated_at: new Date().toISOString()
      }
      
      console.log('PUT: Données de mise à jour préparées:', updateData)
      
      // Effectuer la mise à jour avec vérification de l'ID exact
      const { data: appointment, error } = await supabaseClient
        .from('appointments')
        .update(updateData)
        .eq('id', numericId)
        .select()
        .single()

      if (error) {
        console.error('Erreur mise à jour appointment:', error)
        return new Response(JSON.stringify({ 
          error: `Erreur mise à jour: ${error.message}`,
          details: error
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      
      if (!appointment) {
        console.error('PUT: Aucune ligne mise à jour - données retournées nulles')
        return new Response(JSON.stringify({ 
          error: 'Aucune ligne mise à jour - vérifiez l\'ID'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        })
      }
      
      console.log('PUT: Mise à jour réussie pour:', appointment.client_name)
      
      return new Response(JSON.stringify({ 
        success: true,
        appointment,
        message: `Rendez-vous de ${appointment.client_name} mis à jour avec succès`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'DELETE') {
      console.log('DELETE: Suppression d\'un rendez-vous')
      
      let requestData
      let id
      
      try {
        const body = await req.text()
        console.log('DELETE request body:', body)
        
        if (body) {
          requestData = JSON.parse(body)
          id = requestData.id
        }
      } catch (parseError) {
        const url = new URL(req.url)
        const urlId = url.searchParams.get('id')
        if (urlId) {
          id = parseInt(urlId)
        }
      }

      if (!id || isNaN(id) || id <= 0) {
        return new Response(JSON.stringify({ 
          error: `ID de rendez-vous invalide pour la suppression: ${id}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      const numericId = parseInt(id)
      console.log(`DELETE: Suppression du rendez-vous ID ${numericId}`)
      
      // Vérifier que le rendez-vous existe
      const { data: existingAppointment, error: checkError } = await supabaseClient
        .from('appointments')
        .select('id, client_name')
        .eq('id', numericId)
        .single()

      if (checkError) {
        console.error('DELETE: Erreur vérification existence:', checkError)
        if (checkError.code === 'PGRST116') {
          return new Response(JSON.stringify({ 
            error: `Rendez-vous avec ID ${numericId} non trouvé`
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

      console.log('DELETE: Rendez-vous à supprimer:', existingAppointment.client_name)

      const { data: deletedData, error: deleteError } = await supabaseClient
        .from('appointments')
        .delete()
        .eq('id', numericId)
        .select()

      if (deleteError) {
        console.error('DELETE: Erreur suppression:', deleteError)
        return new Response(JSON.stringify({ 
          error: `Erreur suppression: ${deleteError.message}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      console.log('DELETE: Suppression réussie, données supprimées:', deletedData)

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Rendez-vous de ${existingAppointment.client_name} supprimé avec succès`,
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
    console.error('Erreur générale dans manage-appointments:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    
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
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
      console.log('GET: Récupération des livraisons')
      const { data: deliveries, error } = await supabaseClient
        .from('deliveries')
        .select('*')
        .order('date_livraison', { ascending: true })

      if (error) {
        console.error('Erreur GET deliveries:', error)
        return new Response(JSON.stringify({ 
          error: `Erreur récupération: ${error.message}`,
          deliveries: []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      
      console.log(`GET: ${deliveries?.length || 0} livraisons récupérées`)
      return new Response(JSON.stringify({ deliveries: deliveries || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'POST') {
      console.log('POST: Création d\'une livraison')
      const deliveryData = await req.json()
      console.log('Données reçues POST:', deliveryData)
      
      // Validation selon le schéma DB - champs obligatoires
      if (!deliveryData.client_name || !deliveryData.vehicle_model || !deliveryData.date_livraison) {
        return new Response(JSON.stringify({ 
          error: 'Champs obligatoires manquants: client_name, vehicle_model, date_livraison'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 422
        })
      }
      
      // Préparation des données avec validation des types
      const insertData = {
        client_name: String(deliveryData.client_name).trim(),
        vehicle_model: String(deliveryData.vehicle_model).trim(),
        date_livraison: deliveryData.date_livraison, // Type date
        livreur: deliveryData.livreur ? String(deliveryData.livreur).trim() : null,
        adresse: deliveryData.adresse ? String(deliveryData.adresse).trim() : null,
        statut: deliveryData.statut ? String(deliveryData.statut).trim() : 'Programmée',
        notes: deliveryData.notes ? String(deliveryData.notes).trim() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('Données préparées pour insertion:', insertData)
      
      const { data: delivery, error } = await supabaseClient
        .from('deliveries')
        .insert([insertData])
        .select()
        .single()

      if (error) {
        console.error('Erreur POST delivery:', error)
        return new Response(JSON.stringify({ 
          error: `Erreur création: ${error.message}`,
          details: error
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      
      if (!delivery) {
        return new Response(JSON.stringify({ 
          error: 'Erreur lors de la création - aucune donnée retournée'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        })
      }
      
      console.log('POST: Livraison créée avec succès, ID:', delivery.id)
      return new Response(JSON.stringify({ 
        success: true,
        delivery,
        message: `Livraison pour ${delivery.client_name} créée avec succès`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'PUT') {
      let deliveryData
      let id
      
      try {
        const url = new URL(req.url)
        id = url.searchParams.get('id')
        
        const bodyText = await req.text()
        console.log('PUT request body:', bodyText)
        
        if (!bodyText?.trim()) {
          return new Response(JSON.stringify({ 
            error: 'Corps de requête vide'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          })
        }
        
        deliveryData = JSON.parse(bodyText)
        console.log('PUT parsed data:', deliveryData)
      } catch (parseError) {
        console.error('Erreur parsing JSON:', parseError)
        return new Response(JSON.stringify({ 
          error: `Données JSON invalides: ${parseError.message}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      
      if (!id) {
        return new Response(JSON.stringify({ 
          error: 'ID de livraison manquant pour la mise à jour'
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
      if (!deliveryData.client_name || !deliveryData.vehicle_model || !deliveryData.date_livraison) {
        return new Response(JSON.stringify({ 
          error: 'Champs obligatoires manquants: client_name, vehicle_model, date_livraison'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 422
        })
      }
      
      // Vérifier que la livraison existe
      const { data: existingDelivery, error: checkError } = await supabaseClient
        .from('deliveries')
        .select('*')
        .eq('id', numericId)
        .single()

      if (checkError) {
        console.error('Erreur vérification existence:', checkError)
        if (checkError.code === 'PGRST116') {
          return new Response(JSON.stringify({ 
            error: `Livraison avec ID ${numericId} non trouvée`
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
      
      console.log('PUT: Livraison existante:', existingDelivery.client_name)
      
      // Préparer les données de mise à jour avec validation des types
      const updateData = {
        client_name: String(deliveryData.client_name).trim(),
        vehicle_model: String(deliveryData.vehicle_model).trim(),
        date_livraison: deliveryData.date_livraison,
        livreur: deliveryData.livreur ? String(deliveryData.livreur).trim() : existingDelivery.livreur,
        adresse: deliveryData.adresse ? String(deliveryData.adresse).trim() : existingDelivery.adresse,
        statut: deliveryData.statut ? String(deliveryData.statut).trim() : existingDelivery.statut,
        notes: deliveryData.notes ? String(deliveryData.notes).trim() : existingDelivery.notes,
        updated_at: new Date().toISOString()
      }
      
      console.log('PUT: Données à mettre à jour:', updateData)
      
      const { data: delivery, error } = await supabaseClient
        .from('deliveries')
        .update(updateData)
        .eq('id', numericId)
        .select()
        .single()

      if (error) {
        console.error('Erreur mise à jour delivery:', error)
        return new Response(JSON.stringify({ 
          error: `Erreur mise à jour: ${error.message}`,
          details: error
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      
      if (!delivery) {
        console.error('PUT: Aucune donnée retournée')
        return new Response(JSON.stringify({ 
          error: 'Aucune ligne mise à jour - vérifiez l\'ID'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        })
      }
      
      console.log('PUT: Livraison mise à jour:', delivery.client_name)
      
      return new Response(JSON.stringify({ 
        success: true,
        delivery,
        message: `Livraison pour ${delivery.client_name} mise à jour avec succès`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'DELETE') {
      console.log('DELETE: Suppression d\'une livraison')
      
      let id
      
      try {
        const url = new URL(req.url)
        id = url.searchParams.get('id')
      } catch (parseError) {
        console.log('Erreur extraction ID depuis URL')
      }
      
      console.log('DELETE ID extrait:', id)

      if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        console.error('ID manquant ou invalide:', id)
        return new Response(JSON.stringify({ 
          error: `ID de livraison invalide: ${id}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      const numericId = parseInt(id)
      
      // Vérifier que la livraison existe
      const { data: existingDelivery, error: checkError } = await supabaseClient
        .from('deliveries')
        .select('id, client_name')
        .eq('id', numericId)
        .single()

      if (checkError) {
        console.error('Erreur vérification existence:', checkError)
        if (checkError.code === 'PGRST116') {
          return new Response(JSON.stringify({ 
            error: `Livraison avec ID ${numericId} non trouvée`
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

      console.log('Livraison trouvée, suppression en cours...')

      const { data: deletedData, error: deleteError } = await supabaseClient
        .from('deliveries')
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

      console.log('DELETE: Livraison supprimée avec succès')
      return new Response(JSON.stringify({ 
        success: true, 
        message: `Livraison pour ${existingDelivery.client_name} supprimée avec succès`,
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
    console.error('Erreur générale:', error)
    
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
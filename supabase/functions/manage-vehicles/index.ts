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
      console.log('GET: Récupération des véhicules (admin)')
      const { data: vehicles, error } = await supabaseClient
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur GET vehicles:', error)
        return new Response(JSON.stringify({ 
          error: `Erreur récupération: ${error.message}`,
          vehicles: []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      
      console.log(`GET: ${vehicles?.length || 0} véhicules récupérés`)
      return new Response(JSON.stringify({ vehicles: vehicles || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'POST') {
      console.log('POST: Création d\'un véhicule')
      const vehicleData = await req.json()
      console.log('Données reçues POST:', vehicleData)
      
      // Validation selon le schéma DB - champs obligatoires
      if (!vehicleData.model || !vehicleData.category || vehicleData.price === undefined) {
        return new Response(JSON.stringify({ 
          error: 'Champs obligatoires manquants: model, category, price'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 422
        })
      }
      
      // Préparation des données avec validation des types
      const insertData = {
        model: String(vehicleData.model).trim(),
        category: String(vehicleData.category).trim(),
        price: parseFloat(vehicleData.price), // Type numeric
        autonomy: vehicleData.autonomy ? parseInt(vehicleData.autonomy) : null, // Type integer
        max_speed: vehicleData.max_speed ? parseInt(vehicleData.max_speed) : null, // Type integer
        charging_time: vehicleData.charging_time ? String(vehicleData.charging_time).trim() : null,
        image_url: vehicleData.image_url ? String(vehicleData.image_url).trim() : null,
        description: vehicleData.description ? String(vehicleData.description).trim() : null,
        features: vehicleData.features && Array.isArray(vehicleData.features) ? vehicleData.features : null, // Type ARRAY
        in_stock: vehicleData.in_stock !== undefined ? Boolean(vehicleData.in_stock) : true, // Type boolean
        stock_quantity: vehicleData.stock_quantity ? parseInt(vehicleData.stock_quantity) : 0, // Type integer
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Validation des valeurs numériques
      if (isNaN(insertData.price) || insertData.price < 0) {
        return new Response(JSON.stringify({ 
          error: 'Prix invalide - doit être un nombre positif'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 422
        })
      }
      
      console.log('Données préparées pour insertion:', insertData)
      
      const { data: vehicle, error } = await supabaseClient
        .from('vehicles')
        .insert([insertData])
        .select()
        .single()

      if (error) {
        console.error('Erreur POST vehicle:', error)
        return new Response(JSON.stringify({ 
          error: `Erreur création: ${error.message}`,
          details: error
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      
      if (!vehicle) {
        return new Response(JSON.stringify({ 
          error: 'Erreur lors de la création - aucune donnée retournée'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        })
      }
      
      console.log('POST: Véhicule créé avec succès, ID:', vehicle.id)
      return new Response(JSON.stringify({ 
        success: true,
        vehicle,
        message: `Véhicule ${vehicle.model} créé avec succès`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'PUT') {
      let vehicleData
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
        
        vehicleData = JSON.parse(bodyText)
        console.log('PUT parsed data:', vehicleData)
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
          error: 'ID de véhicule manquant pour la mise à jour'
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
      if (!vehicleData.model || !vehicleData.category || vehicleData.price === undefined) {
        return new Response(JSON.stringify({ 
          error: 'Champs obligatoires manquants: model, category, price'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 422
        })
      }
      
      // Vérifier que le véhicule existe
      const { data: existingVehicle, error: checkError } = await supabaseClient
        .from('vehicles')
        .select('*')
        .eq('id', numericId)
        .single()

      if (checkError) {
        console.error('Erreur vérification existence:', checkError)
        if (checkError.code === 'PGRST116') {
          return new Response(JSON.stringify({ 
            error: `Véhicule avec ID ${numericId} non trouvé`
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
      
      console.log('PUT: Véhicule existant:', existingVehicle.model)
      
      // Préparer les données de mise à jour avec validation des types
      const updateData = {
        model: String(vehicleData.model).trim(),
        category: String(vehicleData.category).trim(),
        price: parseFloat(vehicleData.price),
        autonomy: vehicleData.autonomy ? parseInt(vehicleData.autonomy) : existingVehicle.autonomy,
        max_speed: vehicleData.max_speed ? parseInt(vehicleData.max_speed) : existingVehicle.max_speed,
        charging_time: vehicleData.charging_time ? String(vehicleData.charging_time).trim() : existingVehicle.charging_time,
        image_url: vehicleData.image_url ? String(vehicleData.image_url).trim() : existingVehicle.image_url,
        description: vehicleData.description ? String(vehicleData.description).trim() : existingVehicle.description,
        features: vehicleData.features && Array.isArray(vehicleData.features) ? vehicleData.features : existingVehicle.features,
        in_stock: vehicleData.in_stock !== undefined ? Boolean(vehicleData.in_stock) : existingVehicle.in_stock,
        stock_quantity: vehicleData.stock_quantity ? parseInt(vehicleData.stock_quantity) : existingVehicle.stock_quantity,
        updated_at: new Date().toISOString()
      }
      
      // Validation des valeurs numériques
      if (isNaN(updateData.price) || updateData.price < 0) {
        return new Response(JSON.stringify({ 
          error: 'Prix invalide - doit être un nombre positif'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 422
        })
      }
      
      console.log('PUT: Données à mettre à jour:', updateData)
      
      const { data: vehicle, error } = await supabaseClient
        .from('vehicles')
        .update(updateData)
        .eq('id', numericId)
        .select()
        .single()

      if (error) {
        console.error('Erreur mise à jour vehicle:', error)
        return new Response(JSON.stringify({ 
          error: `Erreur mise à jour: ${error.message}`,
          details: error
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      
      if (!vehicle) {
        console.error('PUT: Aucune donnée retournée')
        return new Response(JSON.stringify({ 
          error: 'Aucune ligne mise à jour - vérifiez l\'ID'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        })
      }
      
      console.log('PUT: Véhicule mis à jour:', vehicle.model)
      
      return new Response(JSON.stringify({ 
        success: true,
        vehicle,
        message: `Véhicule ${vehicle.model} mis à jour avec succès`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'DELETE') {
      console.log('🔴 DELETE: Début suppression véhicule')
      
      let id
      
      try {
        const url = new URL(req.url)
        id = url.searchParams.get('id')
        console.log('🔴 DELETE: ID extrait de l\'URL:', id)
      } catch (parseError) {
        console.error('🔴 DELETE: Erreur extraction ID depuis URL:', parseError)
      }

      if (!id) {
        console.error('🔴 DELETE: ID manquant dans la requête')
        return new Response(JSON.stringify({ 
          error: 'ID de véhicule manquant dans la requête DELETE'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      const numericId = parseInt(id)
      
      if (isNaN(numericId) || numericId <= 0) {
        console.error('🔴 DELETE: ID invalide:', id, '-> Numérique:', numericId)
        return new Response(JSON.stringify({ 
          error: `ID de véhicule invalide: "${id}" doit être un nombre entier positif`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      
      console.log('🔴 DELETE: ID validé:', numericId)
      
      // Vérifier que le véhicule existe avant suppression
      const { data: existingVehicle, error: checkError } = await supabaseClient
        .from('vehicles')
        .select('id, model, category')
        .eq('id', numericId)
        .single()

      if (checkError) {
        console.error('🔴 DELETE: Erreur vérification existence:', checkError)
        if (checkError.code === 'PGRST116') {
          return new Response(JSON.stringify({ 
            error: `Véhicule avec ID ${numericId} non trouvé en base`,
            code: 'NOT_FOUND'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404
          })
        }
        return new Response(JSON.stringify({ 
          error: `Erreur vérification véhicule: ${checkError.message}`,
          details: checkError
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      if (!existingVehicle) {
        console.error('🔴 DELETE: Véhicule inexistant ID:', numericId)
        return new Response(JSON.stringify({ 
          error: `Aucun véhicule trouvé avec l'ID ${numericId}`,
          code: 'NOT_FOUND'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        })
      }

      console.log('🔴 DELETE: Véhicule trouvé:', existingVehicle.model, '- Suppression en cours...')

      // Effectuer la suppression
      const { data: deletedData, error: deleteError } = await supabaseClient
        .from('vehicles')
        .delete()
        .eq('id', numericId)
        .select()

      if (deleteError) {
        console.error('🔴 DELETE: Erreur suppression Supabase:', deleteError)
        return new Response(JSON.stringify({ 
          error: `Erreur lors de la suppression: ${deleteError.message}`,
          details: deleteError,
          vehicleId: numericId
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        })
      }

      console.log('🔴 DELETE: Données supprimées:', deletedData)
      
      if (!deletedData || deletedData.length === 0) {
        console.error('🔴 DELETE: Aucune donnée supprimée - véhicule peut-être déjà supprimé')
        return new Response(JSON.stringify({ 
          error: `Aucune ligne supprimée pour l'ID ${numericId}. Le véhicule a peut-être déjà été supprimé.`,
          code: 'ALREADY_DELETED',
          vehicleId: numericId
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 410 // Gone
        })
      }

      console.log('✅ DELETE: Véhicule supprimé avec succès - ID:', numericId)
      
      return new Response(JSON.stringify({ 
        success: true, 
        deleted: true,
        message: `Véhicule "${existingVehicle.model}" (ID: ${numericId}) supprimé avec succès`,
        id: numericId,
        deletedVehicle: existingVehicle,
        deletedData: deletedData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
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
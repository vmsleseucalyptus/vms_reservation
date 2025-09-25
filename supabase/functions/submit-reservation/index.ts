import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const reservationData = await req.json()

    // Insérer la nouvelle réservation
    const { data: reservation, error } = await supabaseClient
      .from('reservations')
      .insert([{
        client_name: reservationData.clientName,
        telephone: reservationData.telephone,
        email: reservationData.email,
        vehicle_model: reservationData.vehicleModel,
        reservation_type: reservationData.reservationType,
        date_reservation: new Date().toISOString().split('T')[0],
        date_retrait: reservationData.dateRetrait,
        status: 'En attente',
        notes: reservationData.notes || ''
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Réservation enregistrée avec succès',
        reservation 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
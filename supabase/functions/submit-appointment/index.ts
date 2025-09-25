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

    const appointmentData = await req.json()

    // Insérer le nouveau rendez-vous
    const { data: appointment, error } = await supabaseClient
      .from('appointments')
      .insert([{
        client_name: appointmentData.clientName,
        telephone: appointmentData.telephone,
        email: appointmentData.email,
        appointment_type: appointmentData.appointmentType,
        date_appointment: appointmentData.dateAppointment,
        time_appointment: appointmentData.timeAppointment,
        service_type: appointmentData.serviceType,
        vehicle_model: appointmentData.vehicleModel,
        status: 'Programmé',
        notes: appointmentData.notes || ''
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Rendez-vous enregistré avec succès',
        appointment 
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
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

    const method = req.method
    const url = new URL(req.url)
    const photoId = url.searchParams.get('id')
    const category = url.searchParams.get('category')

    if (method === 'GET') {
      let query = supabaseClient
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false })

      if (category && category !== 'Toutes') {
        query = query.eq('category', category)
      }

      const { data: photos, error } = await query

      if (error) throw error
      return new Response(JSON.stringify({ photos }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'POST') {
      const photoData = await req.json()
      const { data: photo, error } = await supabaseClient
        .from('photos')
        .insert([photoData])
        .select()
        .single()

      if (error) throw error
      return new Response(JSON.stringify({ photo }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'PUT' && photoId) {
      const photoData = await req.json()
      const { data: photo, error } = await supabaseClient
        .from('photos')
        .update({ ...photoData, updated_at: new Date().toISOString() })
        .eq('id', photoId)
        .select()
        .single()

      if (error) throw error
      return new Response(JSON.stringify({ photo }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'DELETE') {
      if (photoId) {
        // Supprimer une photo spécifique
        const { error } = await supabaseClient
          .from('photos')
          .delete()
          .eq('id', photoId)

        if (error) throw error
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else {
        // Suppression en masse
        const { ids } = await req.json()
        const { error } = await supabaseClient
          .from('photos')
          .delete()
          .in('id', ids)

        if (error) throw error
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response('Method not allowed', { status: 405 })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
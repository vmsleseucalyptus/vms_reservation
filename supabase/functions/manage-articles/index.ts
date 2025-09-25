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
    const articleId = url.searchParams.get('id')
    const status = url.searchParams.get('status')
    const category = url.searchParams.get('category')

    if (method === 'GET') {
      let query = supabaseClient
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })

      if (status && status !== 'Tous') {
        query = query.eq('status', status)
      }
      if (category && category !== 'Toutes') {
        query = query.eq('category', category)
      }

      const { data: articles, error } = await query

      if (error) throw error
      return new Response(JSON.stringify({ articles }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'POST') {
      const articleData = await req.json()
      const { data: article, error } = await supabaseClient
        .from('articles')
        .insert([{
          ...articleData,
          publish_date: articleData.status === 'Publié' ? new Date().toISOString().split('T')[0] : null
        }])
        .select()
        .single()

      if (error) throw error
      return new Response(JSON.stringify({ article }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'PUT') {
      if (articleId) {
        // Mise à jour d'un article spécifique
        const articleData = await req.json()
        const { data: article, error } = await supabaseClient
          .from('articles')
          .update({
            ...articleData,
            last_modified: new Date().toISOString().split('T')[0],
            publish_date: articleData.status === 'Publié' && !articleData.publish_date 
              ? new Date().toISOString().split('T')[0] 
              : articleData.publish_date,
            updated_at: new Date().toISOString()
          })
          .eq('id', articleId)
          .select()
          .single()

        if (error) throw error
        return new Response(JSON.stringify({ article }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else {
        // Mise à jour en masse du statut
        const { ids, newStatus } = await req.json()
        const { data: articles, error } = await supabaseClient
          .from('articles')
          .update({
            status: newStatus,
            last_modified: new Date().toISOString().split('T')[0],
            publish_date: newStatus === 'Publié' ? new Date().toISOString().split('T')[0] : null,
            updated_at: new Date().toISOString()
          })
          .in('id', ids)
          .select()

        if (error) throw error
        return new Response(JSON.stringify({ articles }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    if (method === 'DELETE') {
      if (articleId) {
        // Supprimer un article spécifique
        const { error } = await supabaseClient
          .from('articles')
          .delete()
          .eq('id', articleId)

        if (error) throw error
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else {
        // Suppression en masse
        const { ids } = await req.json()
        const { error } = await supabaseClient
          .from('articles')
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
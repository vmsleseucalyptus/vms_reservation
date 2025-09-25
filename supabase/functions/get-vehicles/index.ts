import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    if (req.method === "POST") {
      const vehicle = await req.json()

      const { data, error } = await supabaseClient
        .from("vehicles")
        .insert([{
          name: vehicle.name,
          model: vehicle.model,
          description: vehicle.description ?? "",
          price: vehicle.price ?? 0,
          in_stock: vehicle.in_stock ?? true,
          photo_url: vehicle.photo_url ?? null
        }])
        .select()
        .single()

      if (error) throw error
      return new Response(JSON.stringify({ vehicle: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      })
    }

    return new Response("Method not allowed", { status: 405 })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    )
  }
})

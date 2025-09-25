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

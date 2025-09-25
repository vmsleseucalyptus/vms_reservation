if (method === 'PUT' && vehicleId) {
  const contentType = req.headers.get("content-type") || ""

  // --- Cas 1 : update avec nouvelle photo locale (multipart) ---
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const model = formData.get("model") as string | null
    const category = formData.get("category") as string | null
    const price = formData.get("price") as string | null
    const description = formData.get("description") as string | null

    let imageUrl: string | undefined = undefined

    if (file) {
      const supabaseStorage = supabaseClient.storage.from("vehicles")
      const filePath = `public/${Date.now()}_${file.name}`

      // upload image locale vers Supabase Storage
      const { error: uploadError } = await supabaseStorage.upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError

      imageUrl = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/vehicles/${filePath}`
    }

    const updateData: any = {
      model: model ?? null,
      category: category ?? null,
      price: price ? Number(price) : null,
      description: description ?? null,
      updated_at: new Date().toISOString(),
    }
    if (imageUrl) updateData.image_url = imageUrl

    const { data: vehicle, error } = await supabaseClient
      .from("vehicles")
      .update(updateData)
      .eq("id", vehicleId)
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify({ vehicle }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }

  // --- Cas 2 : update sans nouvelle image (JSON classique) ---
  const body = await req.json()
  const { data: vehicle, error } = await supabaseClient
    .from("vehicles")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", vehicleId)
    .select()
    .single()

  if (error) throw error

  return new Response(JSON.stringify({ vehicle }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  })
}

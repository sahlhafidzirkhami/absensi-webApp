// app/api/absensi/route.js
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const formData = await request.formData()
    const nama = formData.get('nama')
    const foto = formData.get('foto')         // File blob
    const latitude = formData.get('latitude')
    const longitude = formData.get('longitude')

    // 1. Upload foto ke Supabase Storage
    const fileName = `${Date.now()}_${nama}.jpg`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('foto-absensi')
      .upload(fileName, foto, { contentType: 'image/jpeg' })

    if (uploadError) throw uploadError

    // 2. Ambil public URL foto
    const { data: urlData } = supabase.storage
      .from('foto-absensi')
      .getPublicUrl(fileName)

    // 3. Simpan record ke tabel absensi
    const { error: insertError } = await supabase
      .from('absensi')
      .insert({
        nama,
        foto_url: urlData.publicUrl,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      })

    if (insertError) throw insertError

    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
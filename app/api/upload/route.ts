import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { requireAdminApi } from '@/lib/auth/require-admin'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

// Configurar Cloudinary
const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const api_key = process.env.CLOUDINARY_API_KEY
const api_secret = process.env.CLOUDINARY_API_SECRET

if (!cloud_name || !api_key || !api_secret) {
  console.error('Cloudinary env vars missing:', { cloud_name: !!cloud_name, api_key: !!api_key, api_secret: !!api_secret })
}

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
})

export async function POST(request: NextRequest) {
  // Solo admins pueden subir archivos
  const { error } = await requireAdminApi()
  if (error) return error

  try {
    // Verificar configuración
    if (!cloud_name || !api_key || !api_secret) {
      return NextResponse.json(
        { error: 'Cloudinary no está configurado correctamente en el servidor' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Formato no permitido (usar JPG, PNG, WEBP, GIF o AVIF)' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'La imagen supera los 10 MB' }, { status: 400 })
    }

    // Convertir el archivo a base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'growshop-products',
      resource_type: 'image',
    })

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
    })
  } catch (err) {
    console.error('Error al subir imagen:', err)
    return NextResponse.json({ error: 'Error al subir imagen' }, { status: 500 })
  }
}

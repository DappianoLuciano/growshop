import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 })
    }

    // Convertir el archivo a base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'growshop-products',
      resource_type: 'auto',
    })

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
    })
  } catch (error: any) {
    console.error('Error al subir imagen:', error)
    return NextResponse.json(
      { error: 'Error al subir imagen', details: error.message },
      { status: 500 }
    )
  }
}

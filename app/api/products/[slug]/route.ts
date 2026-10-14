import { NextRequest, NextResponse } from 'next/server'
import { getActiveProductBySlug } from '@/lib/store/products'
import { apiError } from '@/lib/api/errors'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const product = await getActiveProductBySlug(slug)

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    return apiError(error, 'Error al obtener producto')
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getActiveComboBySlug } from '@/lib/store/products'
import { apiError } from '@/lib/api/errors'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const combo = await getActiveComboBySlug(slug)

    if (!combo) {
      return NextResponse.json(
        { error: 'Combo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(combo)
  } catch (error) {
    return apiError(error, 'Error al obtener combo')
  }
}

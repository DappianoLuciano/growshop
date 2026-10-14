import { NextResponse } from 'next/server'
import { listFeaturedProducts } from '@/lib/store/products'
import { apiError } from '@/lib/api/errors'

export async function GET() {
  try {
    const products = await listFeaturedProducts()

    return NextResponse.json(products)
  } catch (error) {
    return apiError(error, 'Error al obtener productos destacados')
  }
}

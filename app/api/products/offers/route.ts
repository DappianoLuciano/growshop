import { NextResponse } from 'next/server'
import { listOfferProducts } from '@/lib/store/products'
import { apiError } from '@/lib/api/errors'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoria')

    const products = await listOfferProducts(categoryId)

    return NextResponse.json(products)
  } catch (error) {
    return apiError(error, 'Error al obtener ofertas')
  }
}

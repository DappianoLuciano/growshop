import { NextResponse } from 'next/server'
import { listProducts } from '@/lib/store/products'
import { apiError } from '@/lib/api/errors'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoria')
    const searchQuery = searchParams.get('busqueda')
    const section = searchParams.get('section')

    const products = await listProducts({ section, categoryId, search: searchQuery })

    return NextResponse.json(products)
  } catch (error) {
    return apiError(error, 'Error al obtener productos')
  }
}

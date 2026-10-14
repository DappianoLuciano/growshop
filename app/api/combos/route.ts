import { NextResponse } from 'next/server'
import { listCombos } from '@/lib/store/products'
import { apiError } from '@/lib/api/errors'

export async function GET() {
  try {
    const combos = await listCombos()

    return NextResponse.json(combos)
  } catch (error) {
    return apiError(error, 'Error al obtener combos')
  }
}

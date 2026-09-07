import { NextRequest, NextResponse } from 'next/server'
import { correoArgentinoService } from '@/lib/shipping/correo-argentino'

/**
 * POST /api/shipments/rates
 * Obtener tarifas de envío
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      origenCP,
      destinoCP,
      peso = 1000, // gramos
      valorDeclarado = 0,
    } = body

    if (!origenCP || !destinoCP) {
      return NextResponse.json(
        { error: 'Se requieren códigos postales de origen y destino' },
        { status: 400 }
      )
    }

    const result = await correoArgentinoService.getRates({
      origenCP,
      destinoCP,
      peso,
      valorDeclarado,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      rates: result.rates,
    })
  } catch (error: any) {
    console.error('Error al obtener tarifas:', error)
    return NextResponse.json(
      { error: 'Error al obtener tarifas', details: error.message },
      { status: 500 }
    )
  }
}

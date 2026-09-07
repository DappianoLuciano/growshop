import { NextRequest, NextResponse } from 'next/server'
import { correoArgentinoService } from '@/lib/shipping/correo-argentino'
import { auth } from '@/lib/auth/auth'

/**
 * GET /api/shipments/track/[trackingNumber]
 * Rastrear un envío
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  // Verificar autenticación
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { trackingNumber } = await params

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Se requiere número de seguimiento' },
        { status: 400 }
      )
    }

    const trackingData = await correoArgentinoService.trackShipment(trackingNumber)

    return NextResponse.json({
      success: true,
      tracking: trackingData,
    })
  } catch (error: any) {
    console.error('Error al rastrear envío:', error)
    return NextResponse.json(
      { error: 'Error al rastrear envío', details: error.message },
      { status: 500 }
    )
  }
}

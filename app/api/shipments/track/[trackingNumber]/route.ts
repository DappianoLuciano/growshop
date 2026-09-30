import { NextRequest, NextResponse } from 'next/server'
import { correoArgentinoService } from '@/lib/shipping/correo-argentino'
import { auth } from '@/lib/auth/auth'
import { isAdmin } from '@/lib/auth/require-admin'
import { apiError } from '@/lib/api/errors'

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
  if (!isAdmin(session)) {
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
  } catch (error) {
    return apiError(error, 'Error al rastrear envío')
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { correoArgentinoService } from '@/lib/shipping/correo-argentino'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const ratesSchema = z.object({
  destinoCP: z.string().trim().regex(/^[A-Za-z]?\d{4}[A-Za-z]{0,3}$/, 'Código postal inválido'),
  peso: z.number().int().min(1).max(30000).default(1000), // gramos
  valorDeclarado: z.number().min(0).max(100_000_000).default(0),
})

/**
 * POST /api/shipments/rates
 * Obtener tarifas de envío (el origen es siempre el CP de la tienda)
 */
export async function POST(request: NextRequest) {
  // Límite: 20 cotizaciones por minuto por IP (cada una consulta a Correo Argentino)
  const ip = getClientIp(request.headers)
  const limit = rateLimit(`rates:${ip}`, 20, 60 * 1000)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Demasiadas consultas. Probá de nuevo en un momento.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = ratesSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Código postal inválido' }, { status: 400 })
  }

  try {
    const result = await correoArgentinoService.getRates({
      origenCP: process.env.NEXT_PUBLIC_STORE_POSTAL_CODE || '1884',
      ...parsed.data,
    })

    if (!result.success) {
      console.error('Error de Correo Argentino al cotizar:', result.error)
      return NextResponse.json({ error: 'No se pudo cotizar el envío' }, { status: 502 })
    }

    return NextResponse.json({
      success: true,
      rates: result.rates,
    })
  } catch (error) {
    console.error('Error al obtener tarifas:', error)
    return NextResponse.json({ error: 'Error al obtener tarifas' }, { status: 500 })
  }
}

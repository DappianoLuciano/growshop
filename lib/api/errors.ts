import { NextResponse } from 'next/server'
import { Prisma } from '@/lib/generated/prisma'

const FIELD_LABELS: Record<string, string> = {
  sku: 'SKU',
  slug: 'nombre (slug)',
  name: 'nombre',
  email: 'email',
  orderNumber: 'número de orden',
}

// Campos del índice único que falló (Prisma los informa distinto según el driver)
function uniqueFields(error: Prisma.PrismaClientKnownRequestError): string[] {
  const meta = error.meta as Record<string, unknown> | undefined
  const target = meta?.target
  if (Array.isArray(target)) return target.map(String)
  if (typeof target === 'string') return [target]

  const cause = (meta?.driverAdapterError as { cause?: { constraint?: { fields?: unknown } } } | undefined)?.cause
  const fields = cause?.constraint?.fields
  return Array.isArray(fields) ? fields.map(String) : []
}

/**
 * Respuesta de error para API routes: loguea el error completo en el servidor
 * y al cliente le devuelve solo un mensaje entendible (nunca el mensaje interno).
 */
export function apiError(error: unknown, fallback: string) {
  console.error(`${fallback}:`, error)

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const fields = uniqueFields(error)
      const label = fields.map(f => FIELD_LABELS[f] ?? f).join(', ')
      return NextResponse.json(
        { error: label ? `Ya existe otro registro con el mismo ${label}` : 'Ya existe un registro con esos datos', fields },
        { status: 409 }
      )
    }
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'No se puede completar: hay otros registros que dependen de este' },
        { status: 409 }
      )
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }
  }

  return NextResponse.json({ error: fallback }, { status: 500 })
}

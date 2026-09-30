import { describe, expect, it, vi } from 'vitest'
import { Prisma } from '@/lib/generated/prisma'
import { apiError } from './errors'

vi.spyOn(console, 'error').mockImplementation(() => {})

const prismaError = (code: string, meta?: Record<string, unknown>) =>
  new Prisma.PrismaClientKnownRequestError('mensaje interno con tablas y columnas', {
    code,
    clientVersion: 'test',
    meta,
  })

describe('apiError', () => {
  it('nunca devuelve el mensaje interno en un error desconocido', async () => {
    const res = apiError(new Error('select * from users where ...'), 'Error al obtener productos')
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'Error al obtener productos' })
  })

  it('traduce un duplicado a 409 con el campo', async () => {
    const res = apiError(prismaError('P2002', { target: ['sku'] }), 'Error al crear producto')
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.fields).toEqual(['sku'])
    expect(body.error).toContain('SKU')
    expect(JSON.stringify(body)).not.toContain('mensaje interno')
  })

  it('lee el campo duplicado del driver adapter', async () => {
    const res = apiError(
      prismaError('P2002', { driverAdapterError: { cause: { constraint: { fields: ['slug'] } } } }),
      'Error al crear categoría'
    )
    expect((await res.json()).fields).toEqual(['slug'])
  })

  it('registro relacionado -> 409, no encontrado -> 404', () => {
    expect(apiError(prismaError('P2003'), 'x').status).toBe(409)
    expect(apiError(prismaError('P2025'), 'x').status).toBe(404)
  })
})

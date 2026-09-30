import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { sendOrderConfirmationEmail } from '@/lib/email/send-order-confirmation'
import { sendOrderShippedEmail } from '@/lib/email/send-order-shipped'
import { auth } from '@/lib/auth/auth'
import { isAdmin } from '@/lib/auth/require-admin'
import { notifyLowStock } from '@/lib/telegram'

const PAYMENT_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'REFUNDED'] as const
const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const
type OrderStatus = (typeof ORDER_STATUSES)[number]

// Desde qué estados se puede pasar a cuáles (el resto se rechaza)
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'PREPARING', 'READY', 'SHIPPED', 'CANCELLED'],
  CONFIRMED: ['PENDING', 'PREPARING', 'READY', 'SHIPPED', 'CANCELLED'],
  PREPARING: ['CONFIRMED', 'READY', 'SHIPPED', 'CANCELLED'],
  READY: ['PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: ['PENDING'],
}

const patchSchema = z.object({
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  status: z.enum(ORDER_STATUSES).optional(),
  trackingNumber: z.string().trim().min(1).max(100).optional(),
})

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

type StockItem = {
  quantity: number
  variantId: string | null
  combo: { products: Array<{ variantId: string; quantity: number }> } | null
}

// El stock está descontado mientras el pago esté aprobado y el pedido no esté cancelado
function holdsStock(order: { paymentStatus: string; status: string }) {
  return order.paymentStatus === 'APPROVED' && order.status !== 'CANCELLED'
}

// Unidades por variante que ocupa un pedido (incluye las de los combos)
function stockMovements(items: StockItem[]) {
  const movements = new Map<string, number>()
  const add = (variantId: string, qty: number) =>
    movements.set(variantId, (movements.get(variantId) || 0) + qty)

  for (const item of items) {
    if (item.combo) {
      for (const cp of item.combo.products) add(cp.variantId, cp.quantity * item.quantity)
    } else if (item.variantId) {
      add(item.variantId, item.quantity)
    }
  }
  return movements
}

const stockItemsInclude = { items: { include: { combo: { include: { products: true } } } } } as const

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificar autenticación
  const session = await auth()
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error al obtener orden:', error)
    return NextResponse.json({ error: 'Error al obtener orden' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificar autenticación - solo admin puede aprobar pagos
  const session = await auth()
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
  const { paymentStatus, status, trackingNumber } = parsed.data

  try {
    const { id } = await params
    const touchedVariantIds: string[] = []

    // Todo en una transacción: si falta stock de algún item, no se descuenta nada
    const { updatedOrder, previous } = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id }, include: stockItemsInclude })
      if (!order) throw new HttpError(404, 'Orden no encontrada')

      if (paymentStatus === 'APPROVED' && order.paymentStatus === 'APPROVED') {
        throw new HttpError(400, 'El pago ya fue aprobado')
      }
      if (status && status !== order.status && !ALLOWED_TRANSITIONS[order.status].includes(status)) {
        throw new HttpError(400, `No se puede pasar un pedido de ${order.status} a ${status}`)
      }

      const next = {
        paymentStatus: paymentStatus ?? order.paymentStatus,
        status: status ?? order.status,
      }
      if (next.paymentStatus === 'APPROVED' && next.status === 'CANCELLED' && paymentStatus === 'APPROVED') {
        throw new HttpError(400, 'No se puede aprobar el pago de un pedido cancelado')
      }

      const heldBefore = holdsStock(order)
      const heldAfter = holdsStock(next)
      const movements = stockMovements(order.items)

      if (!heldBefore && heldAfter) {
        for (const [variantId, qty] of movements) {
          // Descuenta solo si alcanza el stock (evita stock negativo)
          const res = await tx.productVariant.updateMany({
            where: { id: variantId, stock: { gte: qty } },
            data: { stock: { decrement: qty } },
          })
          if (res.count === 0) {
            const v = await tx.productVariant.findUnique({
              where: { id: variantId },
              select: { stock: true, product: { select: { name: true } } },
            })
            throw new HttpError(
              409,
              `Stock insuficiente de "${v?.product.name ?? variantId}" (disponible: ${v?.stock ?? 0}, necesario: ${qty})`
            )
          }
          touchedVariantIds.push(variantId)
        }
      } else if (heldBefore && !heldAfter) {
        // Cancelado / reembolsado / rechazado: devolver el stock
        for (const [variantId, qty] of movements) {
          await tx.productVariant.updateMany({
            where: { id: variantId },
            data: { stock: { increment: qty } },
          })
        }
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          paymentStatus,
          status,
          trackingNumber,
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      })

      return { updatedOrder, previous: order }
    })

    console.log('✅ Orden actualizada:', updatedOrder.orderNumber)

    if (touchedVariantIds.length > 0) {
      notifyLowStock(touchedVariantIds).catch(err => console.error('Error en alerta de stock bajo:', err))
    }

    // Si el pago fue aprobado, enviar email de confirmación
    if (paymentStatus === 'APPROVED' && updatedOrder.customerEmail) {
      try {
        await sendOrderConfirmationEmail({
          to: updatedOrder.customerEmail,
          orderNumber: updatedOrder.orderNumber,
          customerName: updatedOrder.customerName,
          customerEmail: updatedOrder.customerEmail,
          customerPhone: updatedOrder.customerPhone,
          shippingType: updatedOrder.shippingType,
          address: updatedOrder.address,
          city: updatedOrder.city,
          province: updatedOrder.province,
          items: updatedOrder.items.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price.toNumber(),
            subtotal: item.subtotal.toNumber(),
          })),
          subtotal: updatedOrder.subtotal.toNumber(),
          total: updatedOrder.total.toNumber(),
          notes: updatedOrder.notes,
        })
      } catch (emailError) {
        // No fallar la actualización si el email falla
        console.error('❌ Error al enviar email de confirmación:', emailError)
      }
    }

    // Avisar al cliente cuando el pedido sale (una sola vez)
    if (status === 'SHIPPED' && previous.status !== 'SHIPPED' && updatedOrder.customerEmail) {
      sendOrderShippedEmail({
        to: updatedOrder.customerEmail,
        customerName: updatedOrder.customerName,
        orderNumber: updatedOrder.orderNumber,
        trackingNumber: updatedOrder.trackingNumber,
      }).catch(err => console.error('❌ Error al enviar email de envío:', err))
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error al actualizar orden:', error)
    return NextResponse.json({ error: 'Error al actualizar orden' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificar autenticación
  const session = await auth()
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params

    const order = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id }, include: stockItemsInclude })
      if (!order) throw new HttpError(404, 'Orden no encontrada')

      // Si el pedido tenía el stock descontado, devolverlo antes de eliminar
      if (holdsStock(order)) {
        for (const [variantId, qty] of stockMovements(order.items)) {
          await tx.productVariant.updateMany({
            where: { id: variantId },
            data: { stock: { increment: qty } },
          })
        }
      }

      // Eliminar la orden (los items se eliminan en cascada)
      await tx.order.delete({ where: { id } })
      return order
    })

    console.log('✅ Orden eliminada:', order.orderNumber)
    return NextResponse.json({ message: 'Orden eliminada exitosamente' })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error al eliminar orden:', error)
    return NextResponse.json({ error: 'Error al eliminar orden' }, { status: 500 })
  }
}

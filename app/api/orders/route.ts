import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { requireAdminApi } from '@/lib/auth/require-admin'
import { sendTelegramNotification } from '@/lib/telegram'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getVariantUnitPrice, SHIPPING_MARKUP } from '@/lib/orders/pricing'
import { correoArgentinoService } from '@/lib/shipping/correo-argentino'
import { randomBytes } from 'crypto'

const itemSchema = z
  .object({
    variantId: z.string().min(1).max(50).optional().nullable(),
    comboId: z.string().min(1).max(50).optional().nullable(),
    quantity: z.number().int().min(1).max(100),
  })
  .refine(i => Boolean(i.variantId) !== Boolean(i.comboId), {
    message: 'Cada item debe tener variantId o comboId (no ambos)',
  })

const orderSchema = z
  .object({
    customerName: z.string().trim().min(2).max(100),
    customerEmail: z.string().trim().email().max(150),
    customerPhone: z.string().trim().min(6).max(30),
    shippingType: z.enum(['SHIPPING', 'PICKUP', 'ARRANGEMENT']),
    address: z.string().trim().max(200).optional().nullable(),
    city: z.string().trim().max(100).optional().nullable(),
    province: z.string().trim().max(100).optional().nullable(),
    postalCode: z.string().trim().max(10).optional().nullable(),
    shippingService: z.string().trim().max(30).optional().nullable(),
    notes: z.string().trim().max(1000).optional().nullable(),
    items: z.array(itemSchema).min(1).max(50),
  })
  .refine(o => o.shippingType !== 'SHIPPING' || (o.address && o.city && o.province && o.postalCode), {
    message: 'Faltan datos de envío',
  })

export async function POST(request: NextRequest) {
  // Límite: 5 pedidos cada 10 minutos por IP (evita spam de pedidos y de Telegram)
  const ip = getClientIp(request.headers)
  const limit = rateLimit(`order:${ip}`, 5, 10 * 60 * 1000)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Demasiados pedidos seguidos. Probá de nuevo en unos minutos.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = orderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos del pedido inválidos', issues: parsed.error.issues.map(i => i.message) },
      { status: 400 }
    )
  }
  const data = parsed.data

  try {
    // Precios y stock SIEMPRE desde la base, nunca desde el cliente
    const variantIds = data.items.flatMap(i => (i.variantId ? [i.variantId] : []))
    const comboIds = data.items.flatMap(i => (i.comboId ? [i.comboId] : []))

    const [variants, combos] = await Promise.all([
      prisma.productVariant.findMany({
        where: { id: { in: variantIds }, isActive: true, product: { isActive: true } },
        include: { product: true },
      }),
      prisma.combo.findMany({
        where: { id: { in: comboIds }, isActive: true },
        include: { products: { include: { variant: true } } },
      }),
    ])
    const variantMap = new Map(variants.map(v => [v.id, v]))
    const comboMap = new Map(combos.map(c => [c.id, c]))

    // Acumular unidades pedidas por variante (incluye las que vienen dentro de combos)
    const requestedStock = new Map<string, number>()
    const addRequested = (variantId: string, qty: number) =>
      requestedStock.set(variantId, (requestedStock.get(variantId) || 0) + qty)

    const orderItems: Array<{
      variantId: string | null
      comboId: string | null
      productName: string
      size: string | null
      capacity: string | null
      power: string | null
      price: number
      quantity: number
      subtotal: number
    }> = []

    for (const item of data.items) {
      if (item.variantId) {
        const variant = variantMap.get(item.variantId)
        if (!variant) {
          return NextResponse.json({ error: 'Un producto del carrito ya no está disponible' }, { status: 409 })
        }
        const price = getVariantUnitPrice(variant.product, variant)
        addRequested(variant.id, item.quantity)
        orderItems.push({
          variantId: variant.id,
          comboId: null,
          productName: variant.product.name,
          size: variant.size,
          capacity: variant.capacity,
          power: variant.power,
          price,
          quantity: item.quantity,
          subtotal: price * item.quantity,
        })
      } else if (item.comboId) {
        const combo = comboMap.get(item.comboId)
        if (!combo) {
          return NextResponse.json({ error: 'Un combo del carrito ya no está disponible' }, { status: 409 })
        }
        for (const cp of combo.products) addRequested(cp.variantId, cp.quantity * item.quantity)
        const price = combo.price.toNumber()
        orderItems.push({
          variantId: null,
          comboId: combo.id,
          productName: combo.name,
          size: null,
          capacity: null,
          power: null,
          price,
          quantity: item.quantity,
          subtotal: price * item.quantity,
        })
      }
    }

    // Verificar stock disponible
    const stockRows = await prisma.productVariant.findMany({
      where: { id: { in: [...requestedStock.keys()] } },
      select: { id: true, stock: true, product: { select: { name: true } } },
    })
    for (const row of stockRows) {
      if (row.stock < (requestedStock.get(row.id) || 0)) {
        return NextResponse.json(
          { error: `No hay stock suficiente de "${row.product.name}" (disponible: ${row.stock})` },
          { status: 409 }
        )
      }
    }

    const subtotal = orderItems.reduce((sum, i) => sum + i.subtotal, 0)

    // Costo de envío recotizado en el servidor
    let shippingCost = 0
    if (data.shippingType === 'SHIPPING' && data.postalCode && data.shippingService) {
      const quote = await correoArgentinoService.getRates({
        origenCP: process.env.NEXT_PUBLIC_STORE_POSTAL_CODE || '1884',
        destinoCP: data.postalCode,
        peso: 1000,
        valorDeclarado: subtotal,
      })
      const rate = quote.rates?.find(r => r.servicio === data.shippingService)
      if (rate) shippingCost = rate.precio * SHIPPING_MARKUP
    }

    const total = subtotal + shippingCost
    const orderNumber = `ORD-${Date.now()}-${randomBytes(5).toString('hex').toUpperCase()}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingType: data.shippingType,
        address: data.address || null,
        city: data.city || null,
        province: data.province || null,
        postalCode: data.postalCode || null,
        notes: data.notes || null,
        paymentMethod: 'TRANSFER',
        paymentStatus: 'PENDING',
        status: 'PENDING',
        subtotal,
        shippingCost,
        total,
        items: { create: orderItems },
      },
      include: { items: true },
    })

    try {
      await sendTelegramNotification({
        orderId: order.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        items: order.items.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price.toNumber(),
        })),
        total: order.total.toNumber(),
        shippingType: order.shippingType,
        shippingAddress: order.address || undefined,
        createdAt: order.createdAt,
      })
    } catch (telegramError) {
      console.error('Error al enviar notificación de Telegram:', telegramError)
    }

    // Devolver solo lo que el cliente necesita
    return NextResponse.json(
      {
        orderNumber: order.orderNumber,
        items: order.items.map(i => ({
          productName: i.productName,
          quantity: i.quantity,
          price: i.price.toNumber(),
          subtotal: i.subtotal.toNumber(),
        })),
        subtotal: order.subtotal.toNumber(),
        shippingCost: order.shippingCost.toNumber(),
        total: order.total.toNumber(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al crear orden:', error)
    return NextResponse.json({ error: 'Error al crear orden' }, { status: 500 })
  }
}

export async function GET() {
  const { error } = await requireAdminApi()
  if (error) return error

  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
            combo: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error al obtener órdenes:', error)
    return NextResponse.json({ error: 'Error al obtener órdenes' }, { status: 500 })
  }
}

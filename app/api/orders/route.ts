import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingType,
      address,
      city,
      province,
      postalCode,
      notes,
      items,
      subtotal,
      total,
    } = body

    // Generar número de orden único
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Crear la orden con estado PENDING
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        shippingType,
        address: address || null,
        city: city || null,
        province: province || null,
        postalCode: postalCode || null,
        notes: notes || null,
        paymentMethod: 'TRANSFER',
        paymentStatus: 'PENDING',
        status: 'PENDING',
        subtotal,
        shippingCost: 0,
        total,
        items: {
          create: items.map((item: any) => ({
            variantId: item.variantId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            variant: true,
          },
        },
      },
    })

    console.log('✅ Orden creada:', order.orderNumber)
    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear orden:', error)
    return NextResponse.json(
      { error: 'Error al crear orden', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(orders)
  } catch (error: any) {
    console.error('Error al obtener órdenes:', error)
    return NextResponse.json(
      { error: 'Error al obtener órdenes', details: error.message },
      { status: 500 }
    )
  }
}

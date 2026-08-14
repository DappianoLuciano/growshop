import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
  } catch (error: any) {
    console.error('Error al obtener orden:', error)
    return NextResponse.json(
      { error: 'Error al obtener orden', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { paymentStatus, status } = body

    // Si se aprueba el pago, descontar stock
    if (paymentStatus === 'APPROVED') {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
        },
      })

      if (!order) {
        return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
      }

      // Verificar que el pago no esté ya aprobado
      if (order.paymentStatus === 'APPROVED') {
        return NextResponse.json({ error: 'El pago ya fue aprobado' }, { status: 400 })
      }

      // Descontar stock de cada variante
      for (const item of order.items) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }
    }

    // Actualizar la orden
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: paymentStatus || undefined,
        status: status || undefined,
        updatedAt: new Date(),
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

    console.log('✅ Orden actualizada:', updatedOrder.orderNumber)
    return NextResponse.json(updatedOrder)
  } catch (error: any) {
    console.error('Error al actualizar orden:', error)
    return NextResponse.json(
      { error: 'Error al actualizar orden', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    // Si la orden está aprobada, devolver el stock antes de eliminar
    if (order.paymentStatus === 'APPROVED') {
      for (const item of order.items) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        })
      }
    }

    // Eliminar la orden (los items se eliminan en cascada)
    await prisma.order.delete({
      where: { id },
    })

    console.log('✅ Orden eliminada:', order.orderNumber)
    return NextResponse.json({ message: 'Orden eliminada exitosamente' })
  } catch (error: any) {
    console.error('Error al eliminar orden:', error)
    return NextResponse.json(
      { error: 'Error al eliminar orden', details: error.message },
      { status: 500 }
    )
  }
}

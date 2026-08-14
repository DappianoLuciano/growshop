import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: {
                      orderBy: {
                        order: 'asc',
                      },
                      take: 1,
                    },
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

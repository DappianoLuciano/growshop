import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/auth'

export async function GET() {
  try {
    // Verificar autenticación
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener últimas 3 órdenes
    const recentOrders = await prisma.order.findMany({
      take: 3,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        paymentStatus: true,
        createdAt: true,
      },
    })

    // Obtener productos con stock bajo (menos de 5 unidades)
    const lowStockVariants = await prisma.productVariant.findMany({
      where: {
        stock: {
          lt: 5,
        },
      },
      take: 5,
      orderBy: {
        stock: 'asc',
      },
      include: {
        product: true,
      },
    })

    const lowStockProducts = lowStockVariants.map((variant) => ({
      id: variant.product.id,
      name: `${variant.product.name} ${variant.capacity || variant.size || variant.power || ''}`.trim(),
      stock: variant.stock,
      slug: variant.product.slug,
    }))

    // Calcular ventas de hoy
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'APPROVED',
        createdAt: {
          gte: today,
        },
      },
      select: {
        total: true,
      },
    })

    const todaySales = todayOrders.reduce((sum, order) => {
      return sum + parseFloat(order.total.toString())
    }, 0)

    return NextResponse.json({
      recentOrders: recentOrders.map(order => ({
        ...order,
        total: parseFloat(order.total.toString()),
      })),
      lowStockProducts,
      todaySales: Math.floor(todaySales),
    })
  } catch (error: any) {
    console.error('Error al obtener actividad reciente:', error)
    return NextResponse.json(
      { error: 'Error al obtener actividad reciente', details: error.message },
      { status: 500 }
    )
  }
}

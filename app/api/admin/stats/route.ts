import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/auth'

export async function GET() {
  // Verificar autenticación - información sensible
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const [
      totalProducts,
      totalCategories,
      totalOrders,
      pendingOrders,
      approvedOrders,
      monthSales
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.order.count({ where: { paymentStatus: 'PENDING' } }),
      prisma.order.count({ where: { paymentStatus: 'APPROVED' } }),
      prisma.order.aggregate({
        where: {
          paymentStatus: 'APPROVED',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { total: true }
      })
    ])

    return NextResponse.json({
      totalProducts,
      totalCategories,
      totalOrders,
      pendingOrders,
      approvedOrders,
      totalSales: monthSales._sum.total || 0
    })
  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas', details: error.message },
      { status: 500 }
    )
  }
}

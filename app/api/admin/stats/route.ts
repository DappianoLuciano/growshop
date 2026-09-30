import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/auth'
import { isAdmin } from '@/lib/auth/require-admin'
import { apiError } from '@/lib/api/errors'

export async function GET() {
  // Verificar autenticación - información sensible
  const session = await auth()
  if (!isAdmin(session)) {
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
  } catch (error) {
    return apiError(error, 'Error al obtener estadísticas')
  }
}

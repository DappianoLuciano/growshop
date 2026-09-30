import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/auth'
import { isAdmin } from '@/lib/auth/require-admin'

/**
 * GET /api/profits
 * Obtener listado de ganancias
 */
export async function GET(request: NextRequest) {
  // Verificar autenticación
  const session = await auth()
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // SHIPPING, PRODUCT_SALE, etc.
    const orderId = searchParams.get('orderId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    if (type) {
      where.type = type
    }

    if (orderId) {
      where.orderId = orderId
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    const profits = await prisma.profit.findMany({
      where,
      include: {
        order: {
          select: {
            orderNumber: true,
            customerName: true,
            total: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calcular totales
    const totals = profits.reduce(
      (acc, profit) => {
        const amount = parseFloat(profit.amount.toString())
        acc.total += amount

        if (profit.type === 'SHIPPING') {
          acc.shipping += amount
        } else if (profit.type === 'PRODUCT_SALE') {
          acc.productSale += amount
        } else if (profit.type === 'COMBO_SALE') {
          acc.comboSale += amount
        } else {
          acc.other += amount
        }

        return acc
      },
      { total: 0, shipping: 0, productSale: 0, comboSale: 0, other: 0 }
    )

    return NextResponse.json({
      success: true,
      profits,
      totals,
      count: profits.length,
    })
  } catch (error: any) {
    console.error('Error al obtener ganancias:', error)
    return NextResponse.json(
      { error: 'Error al obtener ganancias', details: error.message },
      { status: 500 }
    )
  }
}

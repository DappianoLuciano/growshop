import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { apiError } from '@/lib/api/errors'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoria')

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isOnSale: true,
        ...(categoryId && { categoryId }),
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            sku: true,
            price: true,
            stock: true,
            capacity: true,
            size: true,
            power: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageFit: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    return apiError(error, 'Error al obtener ofertas')
  }
}

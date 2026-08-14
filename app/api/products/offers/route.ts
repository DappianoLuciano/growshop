import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(products)
  } catch (error: any) {
    console.error('Error al obtener ofertas:', error)
    return NextResponse.json(
      { error: 'Error al obtener ofertas', details: error.message },
      { status: 500 }
    )
  }
}

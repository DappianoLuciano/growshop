import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      include: {
        images: {
          orderBy: {
            order: 'asc',
          },
        },
        category: true,
        variants: {
          where: {
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(products)
  } catch (error: any) {
    console.error('Error al obtener productos destacados:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos destacados', details: error.message },
      { status: 500 }
    )
  }
}

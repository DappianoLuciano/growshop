import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        images: {
          orderBy: {
            order: 'asc',
          },
          take: 1,
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
      take: 4,
    })

    return NextResponse.json(products)
  } catch (error: any) {
    console.error('Error al obtener últimos productos:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos', details: error.message },
      { status: 500 }
    )
  }
}

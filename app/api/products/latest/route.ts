import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { apiError } from '@/lib/api/errors'

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
  } catch (error) {
    return apiError(error, 'Error al obtener productos')
  }
}

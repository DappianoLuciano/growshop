import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { apiError } from '@/lib/api/errors'

export async function GET() {
  try {
    const combos = await prisma.combo.findMany({
      where: {
        isActive: true
      },
      include: {
        products: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true,
                    category: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(combos)
  } catch (error) {
    return apiError(error, 'Error al obtener combos')
  }
}

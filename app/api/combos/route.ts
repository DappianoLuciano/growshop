import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

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
  } catch (error: any) {
    console.error('Error al obtener combos:', error)
    return NextResponse.json(
      { error: 'Error al obtener combos', details: error.message },
      { status: 500 }
    )
  }
}

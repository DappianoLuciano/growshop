import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const combo = await prisma.combo.findUnique({
      where: {
        slug,
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
      }
    })

    if (!combo) {
      return NextResponse.json(
        { error: 'Combo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(combo)
  } catch (error: any) {
    console.error('Error al obtener combo:', error)
    return NextResponse.json(
      { error: 'Error al obtener combo', details: error.message },
      { status: 500 }
    )
  }
}

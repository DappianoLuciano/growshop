import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { apiError } from '@/lib/api/errors'

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
  } catch (error) {
    return apiError(error, 'Error al obtener combo')
  }
}

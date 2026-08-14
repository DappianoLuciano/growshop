import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const product = await prisma.product.findUnique({
      where: {
        slug,
        isActive: true,
      },
      include: {
        variants: {
          where: {
            isActive: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        category: true,
        images: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error: any) {
    console.error('Error al obtener producto:', error)
    return NextResponse.json(
      { error: 'Error al obtener producto', details: error.message },
      { status: 500 }
    )
  }
}

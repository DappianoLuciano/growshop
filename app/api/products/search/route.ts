import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json([])
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        variants: {
          where: { isActive: true },
          select: {
            price: true,
          },
          take: 1,
        },
      },
      take: 6, // Máximo 6 resultados en el dropdown
      orderBy: {
        name: 'asc',
      },
    })

    const results = products.map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      slug: product.slug,
      price: product.price,
      isOnSale: product.isOnSale,
      salePrice: product.salePrice,
      image: product.images[0]?.url || null,
    }))

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('Error en búsqueda:', error)
    return NextResponse.json(
      { error: 'Error en búsqueda', details: error.message },
      { status: 500 }
    )
  }
}

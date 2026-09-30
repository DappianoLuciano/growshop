import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoria')
    const searchQuery = searchParams.get('busqueda')
    const section = searchParams.get('section')
    const validSections = ['GROW', 'FERRETERIA', 'ACCESORIOS']

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoryId && { categoryId }),
        ...(section && validSections.includes(section) && { category: { section: section as any } }),
        ...(searchQuery && {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { brand: { contains: searchQuery, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
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
            imageFit: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(products)
  } catch (error: any) {
    console.error('Error al obtener productos:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos', details: error.message },
      { status: 500 }
    )
  }
}

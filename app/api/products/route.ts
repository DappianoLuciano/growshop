import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { apiError } from '@/lib/api/errors'
import { CategorySection } from '@/lib/generated/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoria')
    const searchQuery = searchParams.get('busqueda')
    const section = searchParams.get('section')
    const validSections: string[] = Object.values(CategorySection)

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoryId && { categoryId }),
        ...(section && validSections.includes(section) && { category: { section: section as CategorySection } }),
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
  } catch (error) {
    return apiError(error, 'Error al obtener productos')
  }
}

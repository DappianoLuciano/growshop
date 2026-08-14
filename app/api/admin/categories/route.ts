import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color } = body

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    // Generar slug único
    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    let slug = baseSlug
    let counter = 1
    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        color: color || null,
      },
    })

    console.log('✅ Categoría creada:', category)
    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear categoría:', error)
    return NextResponse.json(
      { error: 'Error al crear categoría', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(categories)
  } catch (error: any) {
    console.error('Error al obtener categorías:', error)
    return NextResponse.json(
      { error: 'Error al obtener categorías', details: error.message },
      { status: 500 }
    )
  }
}

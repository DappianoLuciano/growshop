import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/auth'
import { isAdmin } from '@/lib/auth/require-admin'
import { apiError } from '@/lib/api/errors'
import { CategorySection } from '@/lib/generated/prisma'

export async function POST(request: NextRequest) {
  // Verificar autenticación - solo admin puede crear
  const session = await auth()
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description, color, section, imageFit } = body

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    const validSections = ['GROW', 'FERRETERIA', 'ACCESORIOS']
    if (section && !validSections.includes(section)) {
      return NextResponse.json(
        { error: 'Sección inválida' },
        { status: 400 }
      )
    }

    const validImageFits = ['COVER', 'CONTAIN']
    if (imageFit && !validImageFits.includes(imageFit)) {
      return NextResponse.json(
        { error: 'Ajuste de imagen inválido' },
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
        section: section || 'GROW',
        imageFit: imageFit || 'COVER',
      },
    })

    console.log('✅ Categoría creada:', category)
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    return apiError(error, 'Error al crear categoría')
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')

    const validSections: string[] = Object.values(CategorySection)

    const categories = await prisma.category.findMany({
      where: section && validSections.includes(section) ? { section: section as CategorySection } : undefined,
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
  } catch (error) {
    return apiError(error, 'Error al obtener categorías')
  }
}

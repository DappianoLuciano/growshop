import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/auth'

export async function POST(request: NextRequest) {
  // Verificar autenticación
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Solo loguear en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      console.log('📦 Datos recibidos:', JSON.stringify(body, null, 2))
    }

    const { name, marca, sku, categoryId, price, stock, description, images, isActive, isFeatured, isOnSale, salePrice, capacity, size, power } = body

    // Validar datos requeridos
    if (!name || !marca || !sku || !categoryId || price === undefined || stock === undefined) {
      return NextResponse.json({
        error: 'Faltan campos requeridos',
        missing: {
          name: !name,
          marca: !marca,
          sku: !sku,
          categoryId: !categoryId,
          price: price === undefined,
          stock: stock === undefined
        }
      }, { status: 400 })
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
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Crear producto con su variante
    const product = await prisma.product.create({
      data: {
        name,
        brand: marca || null,
        slug,
        description: description || null,
        price,
        isOnSale: isOnSale || false,
        salePrice: salePrice || null,
        categoryId,
        isActive: isActive !== false,
        isFeatured: isFeatured || false,
        // Crear imágenes si existen
        images: images && images.length > 0 ? {
          create: images
        } : undefined,
        // Crear variante
        variants: {
          create: {
            sku,
            price,
            stock,
            capacity: capacity || null,
            size: size || null,
            power: power || null,
          }
        }
      },
      include: {
        variants: true,
        category: true,
        images: true,
      },
    })

    console.log('✅ Producto creado:', product)
    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error('💥 Error al crear producto:', error)
    console.error('Stack:', error.stack)
    return NextResponse.json(
      { error: 'Error al crear producto', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Verificar autenticación
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        category: true,
        images: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
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

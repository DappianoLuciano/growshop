import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/auth'
import { isAdmin } from '@/lib/auth/require-admin'
import { apiError } from '@/lib/api/errors'

export async function POST(request: NextRequest) {
  // Verificar autenticación
  const session = await auth()
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Solo loguear en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      console.log('📦 Datos recibidos para combo:', JSON.stringify(body, null, 2))
    }

    const { name, description, price, image, products, isActive, isFeatured } = body

    // Validar datos requeridos
    if (!name || price === undefined || !products || products.length === 0) {
      return NextResponse.json({
        error: 'Faltan campos requeridos',
        missing: {
          name: !name,
          price: price === undefined,
          products: !products || products.length === 0
        }
      }, { status: 400 })
    }

    // Validar que cada producto tenga variantId y quantity
    for (const product of products) {
      if (!product.variantId || !product.quantity || product.quantity < 1) {
        return NextResponse.json({
          error: 'Cada producto debe tener variantId y quantity válidos',
        }, { status: 400 })
      }
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
    while (await prisma.combo.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Crear combo con sus productos
    const combo = await prisma.combo.create({
      data: {
        name,
        slug,
        description: description || null,
        price,
        image: image || null,
        isActive: isActive !== false,
        isFeatured: isFeatured || false,
        products: {
          create: products.map((p: { variantId: string; quantity: number }) => ({
            variantId: p.variantId,
            quantity: p.quantity,
          }))
        }
      },
      include: {
        products: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true
                  }
                }
              }
            }
          }
        }
      },
    })

    console.log('✅ Combo creado:', combo)
    return NextResponse.json(combo, { status: 201 })
  } catch (error) {
    return apiError(error, 'Error al crear combo')
  }
}

export async function GET() {
  // Verificar autenticación
  const session = await auth()
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const combos = await prisma.combo.findMany({
      include: {
        products: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(combos)
  } catch (error) {
    return apiError(error, 'Error al obtener combos')
  }
}

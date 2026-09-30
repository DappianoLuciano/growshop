import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/auth'
import { isAdmin } from '@/lib/auth/require-admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificar autenticación
  const session = await auth()
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params

    const combo = await prisma.combo.findUnique({
      where: { id },
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

    if (!combo) {
      return NextResponse.json({ error: 'Combo no encontrado' }, { status: 404 })
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificar autenticación
  const session = await auth()
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, price, image, products, isActive, isFeatured } = body

    // Validar datos requeridos
    if (!name || price === undefined) {
      return NextResponse.json({
        error: 'Faltan campos requeridos',
      }, { status: 400 })
    }

    // Si se proporcionan productos, validar estructura
    if (products) {
      for (const product of products) {
        if (!product.variantId || !product.quantity || product.quantity < 1) {
          return NextResponse.json({
            error: 'Cada producto debe tener variantId y quantity válidos',
          }, { status: 400 })
        }
      }
    }

    // Actualizar combo
    const combo = await prisma.combo.update({
      where: { id },
      data: {
        name,
        description: description || null,
        price,
        image: image || null,
        isActive: isActive !== false,
        isFeatured: isFeatured || false,
        // Si se proporcionan productos, actualizar la relación
        ...(products && {
          products: {
            deleteMany: {},
            create: products.map((p: any) => ({
              variantId: p.variantId,
              quantity: p.quantity,
            }))
          }
        })
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

    console.log('✅ Combo actualizado:', combo)
    return NextResponse.json(combo)
  } catch (error: any) {
    console.error('Error al actualizar combo:', error)
    return NextResponse.json(
      { error: 'Error al actualizar combo', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificar autenticación
  const session = await auth()
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params

    await prisma.combo.delete({
      where: { id },
    })

    console.log('✅ Combo eliminado:', id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error al eliminar combo:', error)
    return NextResponse.json(
      { error: 'Error al eliminar combo', details: error.message },
      { status: 500 }
    )
  }
}

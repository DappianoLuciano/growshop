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

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        category: true,
        images: true,
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
    const { name, marca, sku, categoryId, price, stock, description, images, isActive, isFeatured, isOnSale, salePrice, capacity, size, power } = body

    // Actualizar producto y su variante
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        brand: marca || null,
        description: description || null,
        price,
        isOnSale: isOnSale || false,
        salePrice: salePrice || null,
        categoryId,
        isActive: isActive !== false,
        isFeatured: isFeatured || false,
        // Actualizar imágenes
        images: images && images.length > 0 ? {
          deleteMany: {},
          create: images
        } : undefined,
      },
      include: {
        variants: true,
        category: true,
        images: true,
      },
    })

    // Actualizar la variante (asumimos que solo hay una)
    if (product.variants[0]) {
      await prisma.productVariant.update({
        where: { id: product.variants[0].id },
        data: {
          sku,
          price,
          stock,
          capacity: capacity || null,
          size: size || null,
          power: power || null,
        },
      })
    }

    console.log('✅ Producto actualizado:', product)
    return NextResponse.json(product)
  } catch (error: any) {
    console.error('Error al actualizar producto:', error)
    return NextResponse.json(
      { error: 'Error al actualizar producto', details: error.message },
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

    // Verificar si el producto tiene variantes con órdenes
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            orderItems: true,
            comboProducts: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Verificar si hay órdenes asociadas
    const hasOrders = product.variants.some((v) => v.orderItems.length > 0)
    if (hasOrders) {
      return NextResponse.json(
        { error: 'No se puede eliminar: el producto tiene órdenes asociadas' },
        { status: 400 }
      )
    }

    // Verificar si está en algún combo
    const hasComboProducts = product.variants.some((v) => v.comboProducts.length > 0)
    if (hasComboProducts) {
      return NextResponse.json(
        { error: 'No se puede eliminar: el producto está en uno o más combos' },
        { status: 400 }
      )
    }

    // Si no tiene órdenes ni combos, eliminar el producto
    // Las variantes e imágenes se eliminan en cascada
    await prisma.product.delete({
      where: { id },
    })

    console.log('✅ Producto eliminado:', id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error al eliminar producto:', error)
    return NextResponse.json(
      { error: 'Error al eliminar producto', details: error.message },
      { status: 500 }
    )
  }
}

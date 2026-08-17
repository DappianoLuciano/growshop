import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
  try {
    const { id } = await params

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

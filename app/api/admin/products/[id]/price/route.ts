import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/auth'
import { isAdmin } from '@/lib/auth/require-admin'

export async function PATCH(
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
    const { price } = body

    // Validar precio
    if (!price || price <= 0) {
      return NextResponse.json(
        { error: 'El precio debe ser mayor a 0' },
        { status: 400 }
      )
    }

    // Actualizar el precio del producto
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        price: price,
      },
      include: {
        variants: true,
        category: true,
        images: true,
      },
    })

    // También actualizar el precio de las variantes para mantener sincronizado
    await prisma.productVariant.updateMany({
      where: { productId: id },
      data: {
        price: price,
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error: any) {
    console.error('Error al actualizar precio:', error)
    return NextResponse.json(
      { error: 'Error al actualizar precio', details: error.message },
      { status: 500 }
    )
  }
}

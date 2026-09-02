import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { sendOrderConfirmationEmail } from '@/lib/email/send-order-confirmation'
import { auth } from '@/lib/auth/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificar autenticación
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error: any) {
    console.error('Error al obtener orden:', error)
    return NextResponse.json(
      { error: 'Error al obtener orden', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificar autenticación - solo admin puede aprobar pagos
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { paymentStatus, status } = body

    // Si se aprueba el pago, descontar stock
    if (paymentStatus === 'APPROVED') {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
        },
      })

      if (!order) {
        return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
      }

      // Verificar que el pago no esté ya aprobado
      if (order.paymentStatus === 'APPROVED') {
        return NextResponse.json({ error: 'El pago ya fue aprobado' }, { status: 400 })
      }

      // Descontar stock
      for (const item of order.items) {
        if (item.comboId) {
          // Si es un combo, descontar stock de cada producto que lo compone
          const combo = await prisma.combo.findUnique({
            where: { id: item.comboId },
            include: {
              products: true,
            },
          })

          if (combo) {
            for (const comboProduct of combo.products) {
              await prisma.productVariant.update({
                where: { id: comboProduct.variantId },
                data: {
                  stock: {
                    decrement: comboProduct.quantity * item.quantity,
                  },
                },
              })
            }
          }
        } else if (item.variantId) {
          // Si es un producto individual, descontar stock de la variante
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        }
      }
    }

    // Actualizar la orden
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: paymentStatus || undefined,
        status: status || undefined,
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    })

    console.log('✅ Orden actualizada:', updatedOrder.orderNumber)
    console.log('📧 Verificando envío de email...')
    console.log('   - paymentStatus recibido:', paymentStatus)
    console.log('   - Email del cliente:', updatedOrder.customerEmail)

    // Si el pago fue aprobado, enviar email de confirmación
    if (paymentStatus === 'APPROVED' && updatedOrder.customerEmail) {
      console.log('📧 Iniciando envío de email de confirmación...')
      try {
        const emailData = {
          to: updatedOrder.customerEmail,
          orderNumber: updatedOrder.orderNumber,
          customerName: updatedOrder.customerName,
          customerEmail: updatedOrder.customerEmail,
          customerPhone: updatedOrder.customerPhone,
          shippingType: updatedOrder.shippingType,
          address: updatedOrder.address,
          city: updatedOrder.city,
          province: updatedOrder.province,
          items: updatedOrder.items.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price.toNumber(),
            subtotal: item.subtotal.toNumber(),
          })),
          subtotal: updatedOrder.subtotal.toNumber(),
          total: updatedOrder.total.toNumber(),
          notes: updatedOrder.notes,
        }
        console.log('📧 Datos del email:', JSON.stringify(emailData, null, 2))

        await sendOrderConfirmationEmail(emailData)
        console.log('✅ Email de confirmación enviado exitosamente a:', updatedOrder.customerEmail)
      } catch (emailError: any) {
        console.error('❌ Error al enviar email de confirmación:', emailError)
        console.error('❌ Detalles del error:', emailError.message)
        console.error('❌ Stack:', emailError.stack)
        // No fallar la actualización si el email falla
      }
    } else {
      console.log('⚠️ Email NO enviado. Razón:')
      console.log('   - paymentStatus === "APPROVED"?', paymentStatus === 'APPROVED')
      console.log('   - Tiene email?', !!updatedOrder.customerEmail)
    }

    return NextResponse.json(updatedOrder)
  } catch (error: any) {
    console.error('Error al actualizar orden:', error)
    return NextResponse.json(
      { error: 'Error al actualizar orden', details: error.message },
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
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    // Si la orden está aprobada, devolver el stock antes de eliminar
    if (order.paymentStatus === 'APPROVED') {
      for (const item of order.items) {
        if (item.comboId) {
          // Si es un combo, devolver stock de cada producto que lo compone
          const combo = await prisma.combo.findUnique({
            where: { id: item.comboId },
            include: {
              products: true,
            },
          })

          if (combo) {
            for (const comboProduct of combo.products) {
              await prisma.productVariant.update({
                where: { id: comboProduct.variantId },
                data: {
                  stock: {
                    increment: comboProduct.quantity * item.quantity,
                  },
                },
              })
            }
          }
        } else if (item.variantId) {
          // Si es un producto individual, devolver stock de la variante
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          })
        }
      }
    }

    // Eliminar la orden (los items se eliminan en cascada)
    await prisma.order.delete({
      where: { id },
    })

    console.log('✅ Orden eliminada:', order.orderNumber)
    return NextResponse.json({ message: 'Orden eliminada exitosamente' })
  } catch (error: any) {
    console.error('Error al eliminar orden:', error)
    return NextResponse.json(
      { error: 'Error al eliminar orden', details: error.message },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/auth'
import { correoArgentinoService } from '@/lib/shipping/correo-argentino'

/**
 * POST /api/shipments/create
 * Crear un envío con Correo Argentino y registrar ganancia
 */
export async function POST(request: NextRequest) {
  // Verificar autenticación - solo admin puede crear envíos
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      orderId,
      servicio = 'clasico', // clasico | express | prioritario
      peso = 1000, // peso en gramos (default 1kg)
      dimensiones = { alto: 10, ancho: 20, largo: 30 }, // en cm
      remitente,
    } = body

    // Validar que exista el orderId
    if (!orderId) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la orden' },
        { status: 400 }
      )
    }

    // Obtener la orden
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    // Verificar que la orden esté aprobada
    if (order.paymentStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'La orden debe estar aprobada para generar envío' },
        { status: 400 }
      )
    }

    // Verificar que sea envío a domicilio
    if (order.shippingType !== 'SHIPPING') {
      return NextResponse.json(
        { error: 'Esta orden no requiere envío' },
        { status: 400 }
      )
    }

    // Verificar que no tenga ya un tracking number
    if (order.trackingNumber) {
      return NextResponse.json(
        { error: 'Esta orden ya tiene un envío generado' },
        { status: 400 }
      )
    }

    // Validar datos de envío
    if (!order.address || !order.city || !order.province || !order.postalCode) {
      return NextResponse.json(
        { error: 'Faltan datos de dirección en la orden' },
        { status: 400 }
      )
    }

    // Datos del remitente (tu tienda)
    const defaultRemitente = remitente || {
      nombre: 'GrowShop',
      direccion: 'Tu Dirección',
      localidad: 'Tu Ciudad',
      provincia: 'Tu Provincia',
      codigoPostal: '0000',
      telefono: '1234567890',
    }

    // Crear el envío con Correo Argentino
    console.log('📦 Generando envío para orden:', order.orderNumber)

    const shipmentResult = await correoArgentinoService.createShipment({
      remitente: defaultRemitente,
      destinatario: {
        nombre: order.customerName,
        direccion: order.address,
        localidad: order.city,
        provincia: order.province,
        codigoPostal: order.postalCode,
        telefono: order.customerPhone,
        email: order.customerEmail,
        dni: order.customerDni || undefined,
      },
      paquete: {
        peso,
        alto: dimensiones.alto,
        ancho: dimensiones.ancho,
        largo: dimensiones.largo,
        valorDeclarado: parseFloat(order.total.toString()),
      },
      servicio,
      referencia: order.orderNumber,
    })

    if (!shipmentResult.success) {
      return NextResponse.json(
        { error: shipmentResult.error || 'Error al generar envío' },
        { status: 500 }
      )
    }

    const shippingCost = shipmentResult.cost || 0

    // Actualizar la orden con los datos del envío
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: shipmentResult.trackingNumber,
        ocaShipmentId: shipmentResult.shipmentId,
        shippingCost,
        ocaTrackingData: {
          label: shipmentResult.label,
          estimatedDelivery: shipmentResult.estimatedDelivery,
          servicio,
          createdAt: new Date().toISOString(),
        },
        status: 'SHIPPED',
      },
    })

    // Registrar ganancia: DOBLE del costo de envío
    const profitAmount = shippingCost * 2

    const profit = await prisma.profit.create({
      data: {
        orderId,
        amount: profitAmount,
        description: `Ganancia por envío - Orden ${order.orderNumber} (2x $${shippingCost})`,
        type: 'SHIPPING',
      },
    })

    console.log('✅ Envío generado exitosamente')
    console.log('📦 Tracking:', shipmentResult.trackingNumber)
    console.log('💰 Costo de envío: $', shippingCost)
    console.log('💵 Ganancia registrada: $', profitAmount)

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      shipment: {
        trackingNumber: shipmentResult.trackingNumber,
        shipmentId: shipmentResult.shipmentId,
        label: shipmentResult.label,
        cost: shippingCost,
        estimatedDelivery: shipmentResult.estimatedDelivery,
      },
      profit: {
        id: profit.id,
        amount: profitAmount,
        description: profit.description,
      },
    })
  } catch (error: any) {
    console.error('Error al crear envío:', error)
    return NextResponse.json(
      { error: 'Error al crear envío', details: error.message },
      { status: 500 }
    )
  }
}

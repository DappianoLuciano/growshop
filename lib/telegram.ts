/**
 * Envía una notificación a Telegram cuando se crea una nueva orden
 */
export async function sendTelegramNotification(orderData: {
  orderId: string
  customerName: string
  customerPhone: string
  customerEmail: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  shippingType: string
  shippingAddress?: string
  createdAt: Date
}) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.warn('⚠️ Telegram no configurado - Variables de entorno faltantes')
    return
  }

  try {
    // Formatear la fecha
    const fecha = new Date(orderData.createdAt).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Formatear los productos
    const productosTexto = orderData.items
      .map(item => `• ${item.quantity}x ${item.name} - $${item.price.toLocaleString('es-AR')}`)
      .join('\n')

    // Formatear el tipo de envío
    const envioTexto = orderData.shippingType === 'SHIPPING'
      ? `🚚 Envío a domicilio\n📍 ${orderData.shippingAddress || 'Sin dirección'}`
      : '🏪 Retiro en local'

    // Construir el mensaje
    const mensaje = `🛒 *NUEVA ORDEN #${orderData.orderId.slice(-8).toUpperCase()}*

👤 *Cliente:* ${orderData.customerName}
📱 *Tel:* ${orderData.customerPhone}
📧 *Email:* ${orderData.customerEmail}

📦 *Productos:*
${productosTexto}

💰 *Total:* $${orderData.total.toLocaleString('es-AR')}

${envioTexto}

🕐 ${fecha}

🔗 Ver en admin: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/ordenes`

    // Enviar el mensaje
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: mensaje,
          parse_mode: 'Markdown',
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Error al enviar notificación de Telegram:', error)
      throw new Error(`Telegram API error: ${JSON.stringify(error)}`)
    }

    console.log('✅ Notificación de Telegram enviada correctamente')
  } catch (error) {
    console.error('❌ Error al enviar notificación de Telegram:', error)
    throw error
  }
}

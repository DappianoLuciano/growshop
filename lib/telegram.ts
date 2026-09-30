import { prisma } from '@/lib/db/prisma'
import { SITE_URL } from '@/lib/site'

// Umbral de alerta de stock bajo (configurable por env)
const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD || 3)

/** Escapa caracteres especiales de Telegram Markdown (texto ingresado por usuarios) */
function escapeMd(value: string): string {
  return value.replace(/([_*`\[])/g, '\\$1')
}

/**
 * Envía un mensaje (Markdown) a todos los chat IDs configurados.
 * Lanza error solo si no se pudo enviar a ningún destinatario.
 */
export async function sendTelegramMessage(text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatIds = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatIds) {
    console.warn('⚠️ Telegram no configurado - Variables de entorno faltantes')
    return
  }

  // Separar múltiples chat IDs (separados por coma)
  const chatIdList = chatIds.split(',').map(id => id.trim()).filter(Boolean)

  const results = await Promise.all(
    chatIdList.map(async (chatId) => {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => null)
        console.error(`❌ Error al enviar a ${chatId}:`, error)
        return false
      }
      return true
    })
  )

  const successCount = results.filter(Boolean).length
  if (successCount === 0) {
    throw new Error('No se pudo enviar a ningún destinatario')
  }
}

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
  const fecha = new Date(orderData.createdAt).toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const productosTexto = orderData.items
    .map(item => `• ${item.quantity}x ${escapeMd(item.name)} - $${item.price.toLocaleString('es-AR')}`)
    .join('\n')

  const envioTexto = orderData.shippingType === 'SHIPPING'
    ? `🚚 Envío a domicilio\n📍 ${escapeMd(orderData.shippingAddress || 'Sin dirección')}`
    : '🏪 Retiro en local'

  const mensaje = `🛒 *NUEVA ORDEN #${orderData.orderId.slice(-8).toUpperCase()}*

👤 *Cliente:* ${escapeMd(orderData.customerName)}
📱 *Tel:* ${escapeMd(orderData.customerPhone)}
📧 *Email:* ${escapeMd(orderData.customerEmail)}

📦 *Productos:*
${productosTexto}

💰 *Total:* $${orderData.total.toLocaleString('es-AR')}

${envioTexto}

🕐 ${fecha}

🔗 Ver en admin: ${SITE_URL}/admin/ordenes`

  await sendTelegramMessage(mensaje)
}

/**
 * Avisa por Telegram si alguna de las variantes quedó con stock bajo o agotado.
 */
export async function notifyLowStock(variantIds: string[]) {
  const lowStock = await prisma.productVariant.findMany({
    where: { id: { in: [...new Set(variantIds)] }, stock: { lte: LOW_STOCK_THRESHOLD } },
    select: { stock: true, size: true, capacity: true, power: true, product: { select: { name: true } } },
  })
  if (lowStock.length === 0) return

  const lines = lowStock.map(v => {
    const detail = [v.size, v.capacity, v.power].filter(Boolean).join(' / ')
    const name = escapeMd(v.product.name + (detail ? ` (${detail})` : ''))
    return v.stock <= 0 ? `• ❌ ${name}: *AGOTADO*` : `• ⚠️ ${name}: quedan *${v.stock}*`
  })

  await sendTelegramMessage(`📉 *STOCK BAJO*\n\n${lines.join('\n')}\n\n🔗 ${SITE_URL}/admin/productos`)
}

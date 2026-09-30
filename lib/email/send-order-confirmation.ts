import { resend, EMAIL_FROM } from './resend'
import { generateOrderConfirmationEmail } from './templates/order-confirmation'

interface OrderItem {
  productName: string
  quantity: number
  price: number
  subtotal: number
}

interface SendOrderConfirmationEmailParams {
  to: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingType: 'SHIPPING' | 'PICKUP' | 'ARRANGEMENT'
  address?: string | null
  city?: string | null
  province?: string | null
  items: OrderItem[]
  subtotal: number
  total: number
  notes?: string | null
}

export async function sendOrderConfirmationEmail(params: SendOrderConfirmationEmailParams) {
  const html = generateOrderConfirmationEmail(params)

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: params.to,
    subject: `Pedido Confirmado - ${params.orderNumber}`,
    html,
  })

  if (error) {
    throw new Error(`Error al enviar email: ${error.message}`)
  }

  console.log(`✅ Email de confirmación enviado (orden ${params.orderNumber}, id ${data?.id})`)
  return data
}

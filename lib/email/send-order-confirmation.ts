import { resend } from './resend'
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
  shippingType: 'SHIPPING' | 'PICKUP'
  address?: string | null
  city?: string | null
  province?: string | null
  items: OrderItem[]
  subtotal: number
  total: number
  notes?: string | null
}

export async function sendOrderConfirmationEmail(params: SendOrderConfirmationEmailParams) {
  console.log('📧 [sendOrderConfirmationEmail] Iniciando...')
  console.log('📧 [sendOrderConfirmationEmail] Destinatario:', params.to)
  console.log('📧 [sendOrderConfirmationEmail] Orden:', params.orderNumber)

  const html = generateOrderConfirmationEmail(params)
  console.log('📧 [sendOrderConfirmationEmail] HTML generado, longitud:', html.length)

  try {
    console.log('📧 [sendOrderConfirmationEmail] Llamando a resend.emails.send...')
    const { data, error } = await resend.emails.send({
      from: 'Grow Shop <pedidos@tudominio.com>', // Reemplaza con tu dominio verificado
      to: params.to,
      subject: `Pedido Confirmado - ${params.orderNumber}`,
      html,
    })

    if (error) {
      console.error('❌ [sendOrderConfirmationEmail] Error de Resend:', error)
      throw new Error(`Error al enviar email: ${error.message}`)
    }

    console.log('✅ [sendOrderConfirmationEmail] Email enviado exitosamente!')
    console.log('✅ [sendOrderConfirmationEmail] ID del email:', data?.id)
    return data
  } catch (error: any) {
    console.error('❌ [sendOrderConfirmationEmail] Error capturado:', error)
    console.error('❌ [sendOrderConfirmationEmail] Mensaje:', error.message)
    console.error('❌ [sendOrderConfirmationEmail] Stack:', error.stack)
    throw error
  }
}

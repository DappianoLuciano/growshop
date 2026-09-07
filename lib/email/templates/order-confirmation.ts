interface OrderItem {
  productName: string
  quantity: number
  price: number
  subtotal: number
}

interface OrderConfirmationEmailProps {
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

export function generateOrderConfirmationEmail(props: OrderConfirmationEmailProps): string {
  const {
    orderNumber,
    customerName,
    customerEmail,
    customerPhone,
    shippingType,
    address,
    city,
    province,
    items,
    total,
    notes,
  } = props

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pedido Confirmado - ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #1a1a1a; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
                Grow Shop
              </h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                ¡Tu pedido ha sido confirmado!
              </p>
            </td>
          </tr>

          <!-- Order Number -->
          <tr>
            <td style="padding: 30px; background-color: #111111;">
              <div style="background-color: #16a34a; padding: 15px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Número de Pedido
                </p>
                <p style="margin: 5px 0 0; color: #ffffff; font-size: 24px; font-weight: 900;">
                  ${orderNumber}
                </p>
              </div>
            </td>
          </tr>

          <!-- Customer Info -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h2 style="margin: 0 0 15px; color: #ffffff; font-size: 20px; font-weight: 700;">
                Datos del Cliente
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #9ca3af; font-size: 14px;">Nombre:</td>
                  <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; font-weight: 600;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #9ca3af; font-size: 14px;">Email:</td>
                  <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; font-weight: 600;">${customerEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #9ca3af; font-size: 14px;">Teléfono:</td>
                  <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; font-weight: 600;">${customerPhone}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping Info -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h2 style="margin: 0 0 15px; color: #ffffff; font-size: 20px; font-weight: 700;">
                ${shippingType === 'SHIPPING' ? 'Dirección de Envío' : 'Método de Entrega'}
              </h2>
              ${shippingType === 'SHIPPING' ? `
                <p style="margin: 0; color: #d1d5db; font-size: 14px; line-height: 1.6;">
                  ${address}<br>
                  ${city}, ${province}
                </p>
              ` : shippingType === 'ARRANGEMENT' ? `
                <p style="margin: 0; color: #d1d5db; font-size: 14px; line-height: 1.6;">
                  <strong style="color: #16a34a;">A coordinar con el vendedor</strong>
                </p>
              ` : `
                <p style="margin: 0; color: #d1d5db; font-size: 14px; line-height: 1.6;">
                  <strong style="color: #16a34a;">Retiro en local</strong>
                </p>
              `}
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h2 style="margin: 0 0 15px; color: #ffffff; font-size: 20px; font-weight: 700;">
                Productos
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                ${items.map(item => `
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #333333;">
                      <p style="margin: 0; color: #ffffff; font-size: 15px; font-weight: 600;">
                        ${item.productName}
                      </p>
                      <p style="margin: 5px 0 0; color: #9ca3af; font-size: 13px;">
                        Cantidad: ${item.quantity}
                      </p>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #333333; text-align: right;">
                      <p style="margin: 0; color: #16a34a; font-size: 16px; font-weight: 700;">
                        $${item.subtotal.toLocaleString('es-AR')}
                      </p>
                    </td>
                  </tr>
                `).join('')}
              </table>
            </td>
          </tr>

          <!-- Total -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table style="width: 100%; border-collapse: collapse; background-color: #111111; border-radius: 8px; padding: 20px;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 700;">
                      Total
                    </p>
                  </td>
                  <td style="padding: 15px; text-align: right;">
                    <p style="margin: 0; color: #16a34a; font-size: 28px; font-weight: 900;">
                      $${total.toLocaleString('es-AR')}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${notes ? `
          <!-- Notes -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h2 style="margin: 0 0 10px; color: #ffffff; font-size: 18px; font-weight: 700;">
                Notas
              </h2>
              <p style="margin: 0; color: #d1d5db; font-size: 14px; line-height: 1.6; background-color: #111111; padding: 15px; border-radius: 8px;">
                ${notes}
              </p>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #0a0a0a; text-align: center; border-top: 1px solid #333333;">
              <p style="margin: 0 0 10px; color: #9ca3af; font-size: 14px;">
                ¡Gracias por tu compra!
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                Si tienes alguna pregunta, contáctanos por WhatsApp
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

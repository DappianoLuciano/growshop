import { resend, EMAIL_FROM, escapeHtml } from './resend'
import { SITE_NAME, SITE_URL } from '@/lib/site'

interface SendOrderShippedEmailParams {
  to: string
  customerName: string
  orderNumber: string
  trackingNumber?: string | null
}

export async function sendOrderShippedEmail(params: SendOrderShippedEmailParams) {
  const name = escapeHtml(params.customerName)
  const orderNumber = escapeHtml(params.orderNumber)
  const tracking = params.trackingNumber ? escapeHtml(params.trackingNumber) : null

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Tu pedido está en camino</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:12px;border:1px solid #1f2937;">
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 16px;color:#22c55e;font-size:24px;">🚚 ¡Tu pedido está en camino!</h1>
          <p style="color:#e5e7eb;font-size:15px;line-height:1.6;">Hola ${name}, tu pedido <strong>${orderNumber}</strong> ya fue despachado.</p>
          ${tracking ? `<p style="color:#e5e7eb;font-size:15px;">Número de seguimiento: <strong style="color:#22c55e;">${tracking}</strong></p>` : ''}
          <p style="color:#9ca3af;font-size:13px;margin-top:24px;">Cualquier consulta respondé este email o escribinos por WhatsApp.</p>
          <p style="color:#9ca3af;font-size:13px;">— ${SITE_NAME} · <a href="${SITE_URL}" style="color:#22c55e;">${SITE_URL.replace('https://', '')}</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: params.to,
    subject: `Tu pedido ${params.orderNumber} está en camino`,
    html,
  })

  if (error) throw new Error(`Error al enviar email: ${error.message}`)
}

import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY no está configurada en las variables de entorno')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

// Remitente: debe ser un dominio verificado en Resend (ej: "AgroGrow <pedidos@agrogrowarg.com>")
export const EMAIL_FROM = process.env.EMAIL_FROM || 'AgroGrow <onboarding@resend.dev>'

/** Escapa texto ingresado por usuarios antes de insertarlo en HTML */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

import { Resend } from 'resend'

console.log('🔑 Verificando RESEND_API_KEY...')
console.log('🔑 RESEND_API_KEY presente?', !!process.env.RESEND_API_KEY)
console.log('🔑 RESEND_API_KEY (primeros 10 caracteres):', process.env.RESEND_API_KEY?.substring(0, 10) + '...')

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY no está configurada en las variables de entorno')
}

export const resend = new Resend(process.env.RESEND_API_KEY)
console.log('✅ Cliente de Resend inicializado')

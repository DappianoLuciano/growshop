const { PrismaClient } = require('../lib/generated/prisma')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
require('dotenv').config()

// Configurar conexión a PostgreSQL
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL no está definida en .env')
  process.exit(1)
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function cambiarPassword() {
  try {
    // Uso: node scripts/cambiar-password.js <email> <nueva-password>
    // (no dejar contraseñas escritas en este archivo)
    const [EMAIL_USUARIO, NUEVA_PASSWORD] = process.argv.slice(2)

    if (!EMAIL_USUARIO || !NUEVA_PASSWORD) {
      console.error('Uso: node scripts/cambiar-password.js <email> <nueva-password>')
      process.exit(1)
    }
    if (NUEVA_PASSWORD.length < 12) {
      console.error('❌ La contraseña debe tener al menos 12 caracteres')
      process.exit(1)
    }

    console.log(`🔍 Buscando usuario: ${EMAIL_USUARIO}`)

    // Buscar el usuario
    const usuario = await prisma.user.findUnique({
      where: { email: EMAIL_USUARIO }
    })

    if (!usuario) {
      console.error(`❌ Usuario no encontrado: ${EMAIL_USUARIO}`)
      process.exit(1)
    }

    console.log(`✅ Usuario encontrado: ${usuario.name} (${usuario.email})`)

    // Hashear la nueva contraseña
    console.log('🔐 Hasheando nueva contraseña...')
    const hashedPassword = await bcrypt.hash(NUEVA_PASSWORD, 10)

    // Actualizar en la base de datos
    console.log('💾 Actualizando contraseña en la base de datos...')
    await prisma.user.update({
      where: { email: EMAIL_USUARIO },
      data: { password: hashedPassword }
    })

    console.log(`✅ Contraseña actualizada correctamente para ${EMAIL_USUARIO}`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

cambiarPassword()

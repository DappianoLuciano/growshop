import { config } from 'dotenv'
import { PrismaClient } from '../lib/generated/prisma'
import { hash } from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = 'admin@agrogrow.com'
  const password = 'admin123'
  const hashedPassword = await hash(password, 10)

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log('⚠️  El usuario admin ya existe')
      return
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Admin',
        role: 'ADMIN',
      },
    })

    console.log('✅ Usuario admin creado exitosamente')
    console.log('📧 Email:', email)
    console.log('🔑 Contraseña:', password)
  } catch (error) {
    console.error('❌ Error al crear usuario admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

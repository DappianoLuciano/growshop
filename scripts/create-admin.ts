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
  // Uso: npm run create-admin -- <email> <password>
  const [email, password] = process.argv.slice(2)
  if (!email || !password) {
    console.error('Uso: npm run create-admin -- <email> <password>')
    process.exit(1)
  }
  if (password.length < 12) {
    console.error('❌ La contraseña debe tener al menos 12 caracteres')
    process.exit(1)
  }
  const hashedPassword = await hash(password, 10)

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log('⚠️  El usuario admin ya existe')
      return
    }

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Admin',
        role: 'ADMIN',
      },
    })

    console.log('✅ Usuario admin creado exitosamente:', email)
  } catch (error) {
    console.error('❌ Error al crear usuario admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

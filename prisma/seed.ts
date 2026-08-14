import { PrismaClient } from '@/lib/generated/prisma'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear usuario admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@growshop.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  const hashedPassword = await hash(adminPassword, 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  })

  console.log('✅ Usuario admin creado:', admin.email)

  // Crear categorías
  const categories = [
    {
      name: 'Fertilizantes',
      slug: 'fertilizantes',
      description: 'Nutrientes y fertilizantes para todas las etapas del cultivo',
    },
    {
      name: 'Sustratos',
      slug: 'sustratos',
      description: 'Tierras y medios de cultivo de alta calidad',
    },
    {
      name: 'Iluminación',
      slug: 'iluminacion',
      description: 'Sistemas de iluminación LED y HPS',
    },
    {
      name: 'Macetas',
      slug: 'macetas',
      description: 'Macetas de diferentes tamaños y materiales',
    },
    {
      name: 'Equipamiento',
      slug: 'equipamiento',
      description: 'Herramientas y equipos de medición',
    },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }

  console.log('✅ Categorías creadas')

  // Crear productos de ejemplo
  const fertilizantesCat = await prisma.category.findUnique({
    where: { slug: 'fertilizantes' },
  })

  const iluminacionCat = await prisma.category.findUnique({
    where: { slug: 'iluminacion' },
  })

  if (fertilizantesCat) {
    const producto1 = await prisma.product.create({
      data: {
        name: 'Advanced Nutrients Grow',
        slug: 'advanced-nutrients-grow',
        brand: 'Advanced Nutrients',
        description: 'Fertilizante base para etapa de crecimiento vegetativo. Fórmula balanceada NPK.',
        price: 12500,
        categoryId: fertilizantesCat.id,
        isFeatured: true,
        variants: {
          create: [
            {
              capacity: '250ml',
              stock: 15,
              price: 12500,
            },
            {
              capacity: '1L',
              stock: 8,
              price: 38000,
            },
            {
              capacity: '5L',
              stock: 3,
              price: 165000,
            },
          ],
        },
      },
    })

    console.log('✅ Producto fertilizante creado:', producto1.name)
  }

  if (iluminacionCat) {
    const producto2 = await prisma.product.create({
      data: {
        name: 'Panel LED Quantum Board',
        slug: 'panel-led-quantum-board',
        brand: 'QuantumTech',
        description: 'Panel LED de última generación con espectro completo. Ideal para todas las etapas.',
        price: 285000,
        categoryId: iluminacionCat.id,
        isFeatured: true,
        variants: {
          create: [
            {
              power: '150W',
              stock: 5,
              price: 285000,
            },
            {
              power: '300W',
              stock: 3,
              price: 485000,
            },
          ],
        },
      },
    })

    console.log('✅ Producto iluminación creado:', producto2.name)
  }

  console.log('🎉 Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

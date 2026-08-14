import 'dotenv/config'
import { prisma } from '../lib/db/prisma'

const categories = [
  { id: '1', name: 'Fertilizantes', slug: 'fertilizantes', description: 'Nutrición completa para todas las etapas' },
  { id: '2', name: 'Iluminación', slug: 'iluminacion', description: 'Tecnología LED de última generación' },
  { id: '3', name: 'Sustratos', slug: 'sustratos', description: 'Medios de cultivo premium' },
  { id: '4', name: 'Macetas', slug: 'macetas', description: 'Contenedores profesionales' },
  { id: '5', name: 'Ventilación', slug: 'ventilacion', description: 'Control de clima óptimo' },
  { id: '6', name: 'Medición', slug: 'medicion', description: 'Equipos de precisión' },
]

async function main() {
  console.log('🌱 Creando categorías...')

  for (const category of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug }
    })

    if (existing) {
      console.log(`⏭️  Categoría "${category.name}" ya existe`)
      continue
    }

    await prisma.category.create({
      data: category
    })

    console.log(`✅ Categoría "${category.name}" creada`)
  }

  console.log('🎉 Categorías creadas exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

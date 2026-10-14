import { cache } from 'react'
import { prisma } from '@/lib/db/prisma'

// Cacheado por request: lo usan generateMetadata y la página en el mismo render
export const getActiveProductBySlug = cache((slug: string) =>
  prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      },
      category: true,
      images: { orderBy: { order: 'asc' } },
    },
  })
)

export async function getSuggestedProducts(excludeId: string, count = 4) {
  const ids = await prisma.product.findMany({
    where: { isActive: true, id: { not: excludeId } },
    select: { id: true },
  })
  const picked = ids
    .map((p) => p.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, count)

  return prisma.product.findMany({
    where: { id: { in: picked } },
    include: {
      images: { orderBy: { order: 'asc' } },
      variants: {
        where: { isActive: true },
        select: { id: true, price: true, stock: true, capacity: true, size: true, power: true },
      },
      category: { select: { id: true, name: true, slug: true, imageFit: true } },
    },
  })
}

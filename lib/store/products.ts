import { cache } from 'react'
import { prisma } from '@/lib/db/prisma'
import { CategorySection, type Prisma } from '@/lib/generated/prisma'

const validSections: string[] = Object.values(CategorySection)

const listingInclude = {
  images: { orderBy: { order: 'asc' } },
  variants: {
    where: { isActive: true },
    select: { id: true, price: true, stock: true, capacity: true, size: true, power: true },
  },
  category: { select: { id: true, name: true, slug: true, imageFit: true } },
} satisfies Prisma.ProductInclude

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

export async function getSuggestedProducts(excludeId?: string, count = 4) {
  const ids = await prisma.product.findMany({
    where: { isActive: true, ...(excludeId && { id: { not: excludeId } }) },
    select: { id: true },
  })
  const picked = ids
    .map((p) => p.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, count)

  return prisma.product.findMany({
    where: { id: { in: picked } },
    include: listingInclude,
  })
}

export const getActiveComboBySlug = cache((slug: string) =>
  prisma.combo.findUnique({
    where: { slug, isActive: true },
    include: {
      products: {
        include: {
          variant: {
            include: {
              product: { include: { images: true, category: true } },
            },
          },
        },
      },
    },
  })
)

export function listProducts({
  section,
  categoryId,
  search,
}: {
  section?: string | null
  categoryId?: string | null
  search?: string | null
}) {
  const validSection = section && validSections.includes(section) ? (section as CategorySection) : null

  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(categoryId && { categoryId }),
      ...(validSection && { category: { section: validSection } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    include: listingInclude,
    orderBy: { createdAt: 'desc' },
  })
}

export function listOfferProducts(categoryId?: string | null) {
  return prisma.product.findMany({
    where: { isActive: true, isOnSale: true, ...(categoryId && { categoryId }) },
    include: {
      ...listingInclude,
      variants: { ...listingInclude.variants, select: { ...listingInclude.variants.select, sku: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export function listFeaturedProducts() {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: {
      images: { orderBy: { order: 'asc' } },
      category: true,
      variants: { where: { isActive: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export function listCategories(section?: string | null) {
  return prisma.category.findMany({
    where: section && validSections.includes(section) ? { section: section as CategorySection } : undefined,
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })
}

export function listCombos() {
  return prisma.combo.findMany({
    where: { isActive: true },
    include: {
      products: {
        include: {
          variant: {
            include: {
              product: { include: { images: true, category: true } },
            },
          },
        },
      },
    },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
  })
}

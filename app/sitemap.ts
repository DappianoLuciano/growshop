import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/db/prisma'
import { SITE_URL } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    '',
    '/productos',
    '/ferreteria',
    '/accesorios',
    '/ofertas',
    '/combos',
    '/categorias',
    '/contacto',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'daily',
    priority: path === '' ? 1 : 0.8,
  }))

  try {
    const [products, combos] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.combo.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
    ])

    return [
      ...staticPages,
      ...products.map((p) => ({
        url: `${SITE_URL}/productos/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...combos.map((c) => ({
        url: `${SITE_URL}/combos/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
    ]
  } catch (error) {
    console.error('Error generando sitemap:', error)
    return staticPages
  }
}

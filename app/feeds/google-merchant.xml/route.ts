import { prisma } from '@/lib/db/prisma'
import { buildGoogleMerchantFeed } from '@/lib/feeds/google-merchant'
import { isComboAvailable } from '@/lib/utils/combo-helpers'

// Google Merchant Center descarga este feed periódicamente
export const revalidate = 3600

export async function GET() {
  try {
    const [products, combos] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        include: {
          images: { orderBy: { order: 'asc' }, select: { url: true } },
          category: { select: { name: true, section: true } },
          variants: {
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
            select: { id: true, sku: true, size: true, capacity: true, power: true, stock: true, price: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.combo.findMany({
        where: { isActive: true },
        include: {
          products: { select: { quantity: true, variant: { select: { id: true, stock: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const xml = buildGoogleMerchantFeed(
      products,
      combos.map((c) => ({ ...c, available: isComboAvailable(c.products) }))
    )

    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    })
  } catch (error) {
    console.error('Error generando feed de Google Merchant:', error)
    return new Response('Error generando el feed', { status: 500 })
  }
}

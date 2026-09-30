import type { Prisma } from '@/lib/generated/prisma'

type ProductForPrice = {
  price: Prisma.Decimal
  isOnSale: boolean
  salePrice: Prisma.Decimal | null
}

type VariantForPrice = {
  price: Prisma.Decimal | null
}

/**
 * Precio de venta de una variante. Misma regla que la tienda:
 * oferta del producto > precio de la variante > precio base del producto.
 */
export function getVariantUnitPrice(product: ProductForPrice, variant: VariantForPrice): number {
  if (product.isOnSale && product.salePrice) return product.salePrice.toNumber()
  if (variant.price) return variant.price.toNumber()
  return product.price.toNumber()
}

// Markup aplicado al costo del correo (el cliente paga el doble del costo real)
export const SHIPPING_MARKUP = 2

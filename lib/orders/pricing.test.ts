import { describe, expect, it } from 'vitest'
import { Prisma } from '@/lib/generated/prisma'
import { getVariantUnitPrice } from './pricing'

const d = (n: number) => new Prisma.Decimal(n)

describe('getVariantUnitPrice', () => {
  it('usa el precio de oferta si el producto está en oferta', () => {
    expect(getVariantUnitPrice({ price: d(1000), isOnSale: true, salePrice: d(800) }, { price: d(1200) })).toBe(800)
  })

  it('usa el precio de la variante si no hay oferta', () => {
    expect(getVariantUnitPrice({ price: d(1000), isOnSale: false, salePrice: d(800) }, { price: d(1200) })).toBe(1200)
  })

  it('usa el precio base si la variante no tiene precio', () => {
    expect(getVariantUnitPrice({ price: d(1000), isOnSale: false, salePrice: null }, { price: null })).toBe(1000)
  })

  it('ignora la oferta si no tiene precio cargado', () => {
    expect(getVariantUnitPrice({ price: d(1000), isOnSale: true, salePrice: null }, { price: null })).toBe(1000)
  })

  it('respeta los decimales', () => {
    expect(getVariantUnitPrice({ price: d(1999.99), isOnSale: false, salePrice: null }, { price: null })).toBe(1999.99)
  })
})

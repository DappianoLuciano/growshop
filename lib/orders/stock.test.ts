import { describe, expect, it } from 'vitest'
import { canTransition, holdsStock, stockChange, stockMovements } from './stock'

describe('holdsStock', () => {
  it('solo ocupa stock con pago aprobado y pedido no cancelado', () => {
    expect(holdsStock({ paymentStatus: 'APPROVED', status: 'PENDING' })).toBe(true)
    expect(holdsStock({ paymentStatus: 'APPROVED', status: 'SHIPPED' })).toBe(true)
    expect(holdsStock({ paymentStatus: 'APPROVED', status: 'CANCELLED' })).toBe(false)
    expect(holdsStock({ paymentStatus: 'PENDING', status: 'PENDING' })).toBe(false)
    expect(holdsStock({ paymentStatus: 'REFUNDED', status: 'DELIVERED' })).toBe(false)
  })
})

describe('stockChange', () => {
  it('descuenta al aprobar el pago', () => {
    expect(stockChange({ paymentStatus: 'PENDING', status: 'PENDING' }, { paymentStatus: 'APPROVED', status: 'PENDING' })).toBe('decrement')
  })

  it('devuelve al cancelar un pedido pagado', () => {
    expect(stockChange({ paymentStatus: 'APPROVED', status: 'PREPARING' }, { paymentStatus: 'APPROVED', status: 'CANCELLED' })).toBe('increment')
  })

  it('devuelve al reembolsar o rechazar', () => {
    expect(stockChange({ paymentStatus: 'APPROVED', status: 'SHIPPED' }, { paymentStatus: 'REFUNDED', status: 'SHIPPED' })).toBe('increment')
    expect(stockChange({ paymentStatus: 'APPROVED', status: 'PENDING' }, { paymentStatus: 'REJECTED', status: 'PENDING' })).toBe('increment')
  })

  it('vuelve a descontar al reabrir un pedido pagado', () => {
    expect(stockChange({ paymentStatus: 'APPROVED', status: 'CANCELLED' }, { paymentStatus: 'APPROVED', status: 'PENDING' })).toBe('decrement')
  })

  it('no toca el stock si el pedido no estaba pagado', () => {
    expect(stockChange({ paymentStatus: 'PENDING', status: 'PENDING' }, { paymentStatus: 'PENDING', status: 'CANCELLED' })).toBeNull()
  })

  it('no toca el stock en cambios de estado de un pedido pagado', () => {
    expect(stockChange({ paymentStatus: 'APPROVED', status: 'PREPARING' }, { paymentStatus: 'APPROVED', status: 'SHIPPED' })).toBeNull()
  })
})

describe('stockMovements', () => {
  it('suma variantes sueltas y las de los combos', () => {
    const movements = stockMovements([
      { quantity: 2, variantId: 'a', combo: null },
      { quantity: 3, variantId: null, combo: { products: [{ variantId: 'a', quantity: 1 }, { variantId: 'b', quantity: 2 }] } },
    ])
    expect(Object.fromEntries(movements)).toEqual({ a: 5, b: 6 })
  })

  it('ignora items sin variante ni combo', () => {
    expect(stockMovements([{ quantity: 1, variantId: null, combo: null }]).size).toBe(0)
  })
})

describe('canTransition', () => {
  it('permite el flujo normal', () => {
    expect(canTransition('PENDING', 'CONFIRMED')).toBe(true)
    expect(canTransition('READY', 'SHIPPED')).toBe(true)
    expect(canTransition('SHIPPED', 'DELIVERED')).toBe(true)
  })

  it('un pedido entregado no se puede modificar', () => {
    expect(canTransition('DELIVERED', 'PENDING')).toBe(false)
    expect(canTransition('DELIVERED', 'CANCELLED')).toBe(false)
  })

  it('un cancelado solo vuelve a pendiente', () => {
    expect(canTransition('CANCELLED', 'PENDING')).toBe(true)
    expect(canTransition('CANCELLED', 'SHIPPED')).toBe(false)
  })

  it('mantener el mismo estado siempre es válido', () => {
    expect(canTransition('DELIVERED', 'DELIVERED')).toBe(true)
  })
})

export const PAYMENT_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'REFUNDED'] as const
export const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

// Desde qué estados se puede pasar a cuáles (el resto se rechaza)
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'PREPARING', 'READY', 'SHIPPED', 'CANCELLED'],
  CONFIRMED: ['PENDING', 'PREPARING', 'READY', 'SHIPPED', 'CANCELLED'],
  PREPARING: ['CONFIRMED', 'READY', 'SHIPPED', 'CANCELLED'],
  READY: ['PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: ['PENDING'],
}

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return from === to || ALLOWED_TRANSITIONS[from].includes(to)
}

export type StockItem = {
  quantity: number
  variantId: string | null
  combo: { products: Array<{ variantId: string; quantity: number }> } | null
}

// El stock está descontado mientras el pago esté aprobado y el pedido no esté cancelado
export function holdsStock(order: { paymentStatus: string; status: string }) {
  return order.paymentStatus === 'APPROVED' && order.status !== 'CANCELLED'
}

// Unidades por variante que ocupa un pedido (incluye las de los combos)
export function stockMovements(items: StockItem[]) {
  const movements = new Map<string, number>()
  const add = (variantId: string, qty: number) =>
    movements.set(variantId, (movements.get(variantId) || 0) + qty)

  for (const item of items) {
    if (item.combo) {
      for (const cp of item.combo.products) add(cp.variantId, cp.quantity * item.quantity)
    } else if (item.variantId) {
      add(item.variantId, item.quantity)
    }
  }
  return movements
}

/**
 * Qué hacer con el stock al pasar de un estado a otro:
 * 'decrement' al empezar a ocuparlo, 'increment' al liberarlo, null si no cambia.
 */
export function stockChange(
  before: { paymentStatus: string; status: string },
  after: { paymentStatus: string; status: string }
): 'decrement' | 'increment' | null {
  const heldBefore = holdsStock(before)
  const heldAfter = holdsStock(after)
  if (!heldBefore && heldAfter) return 'decrement'
  if (heldBefore && !heldAfter) return 'increment'
  return null
}

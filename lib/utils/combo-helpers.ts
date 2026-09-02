/**
 * Helpers para gestión de combos
 */

export interface ComboProductWithStock {
  quantity: number
  variant: {
    id: string
    stock: number
  }
}

/**
 * Calcula cuántas unidades de un combo están disponibles según el stock
 * de los productos individuales que lo componen.
 *
 * @param comboProducts - Array de productos del combo con sus cantidades y stock
 * @returns Número de combos disponibles (0 si algún producto no tiene stock suficiente)
 *
 * @example
 * // Un combo que incluye:
 * // - 2x Producto A (stock: 10)
 * // - 1x Producto B (stock: 3)
 * // - 1x Producto C (stock: 20)
 * // Resultado: 3 combos disponibles (limitado por Producto B)
 *
 * const available = calculateComboAvailability([
 *   { quantity: 2, variant: { id: 'A', stock: 10 } }, // Permite 5 combos
 *   { quantity: 1, variant: { id: 'B', stock: 3 } },  // Permite 3 combos
 *   { quantity: 1, variant: { id: 'C', stock: 20 } }, // Permite 20 combos
 * ])
 * // available = 3
 */
export function calculateComboAvailability(comboProducts: ComboProductWithStock[]): number {
  if (!comboProducts || comboProducts.length === 0) {
    return 0
  }

  // Calcular cuántos combos se pueden hacer con cada producto
  const availablePerProduct = comboProducts.map(cp => {
    if (cp.variant.stock === 0) return 0
    return Math.floor(cp.variant.stock / cp.quantity)
  })

  // El combo está disponible según el producto más limitante
  return Math.min(...availablePerProduct)
}

/**
 * Verifica si un combo está disponible (al menos 1 unidad)
 *
 * @param comboProducts - Array de productos del combo
 * @returns true si el combo está disponible, false si no
 */
export function isComboAvailable(comboProducts: ComboProductWithStock[]): boolean {
  return calculateComboAvailability(comboProducts) > 0
}

/**
 * Calcula el stock necesario de cada producto para vender N combos
 *
 * @param comboProducts - Array de productos del combo con sus cantidades
 * @param combosToSell - Número de combos que se quieren vender
 * @returns Map con el stock necesario por cada variant ID
 *
 * @example
 * // Para vender 5 combos que incluyen:
 * // - 2x Producto A
 * // - 1x Producto B
 * const required = calculateRequiredStock([
 *   { quantity: 2, variant: { id: 'variantA', stock: 100 } },
 *   { quantity: 1, variant: { id: 'variantB', stock: 100 } },
 * ], 5)
 * // required = Map { 'variantA' => 10, 'variantB' => 5 }
 */
export function calculateRequiredStock(
  comboProducts: ComboProductWithStock[],
  combosToSell: number
): Map<string, number> {
  const required = new Map<string, number>()

  comboProducts.forEach(cp => {
    required.set(cp.variant.id, cp.quantity * combosToSell)
  })

  return required
}

/**
 * Valida si hay stock suficiente para vender N combos
 *
 * @param comboProducts - Array de productos del combo
 * @param combosToSell - Número de combos que se quieren vender
 * @returns Objeto con validación y detalles de productos faltantes
 */
export function validateComboStock(
  comboProducts: ComboProductWithStock[],
  combosToSell: number
): {
  valid: boolean
  available: number
  missing?: Array<{
    variantId: string
    required: number
    available: number
    missing: number
  }>
} {
  const available = calculateComboAvailability(comboProducts)

  if (combosToSell <= available) {
    return { valid: true, available }
  }

  // Calcular qué productos faltan
  const requiredStock = calculateRequiredStock(comboProducts, combosToSell)
  const missing = comboProducts
    .map(cp => {
      const required = requiredStock.get(cp.variant.id) || 0
      const stockAvailable = cp.variant.stock
      const deficit = Math.max(0, required - stockAvailable)

      if (deficit > 0) {
        return {
          variantId: cp.variant.id,
          required,
          available: stockAvailable,
          missing: deficit
        }
      }
      return null
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  return {
    valid: false,
    available,
    missing
  }
}

/**
 * IMPORTANTE - USO EN SISTEMA DE VENTAS:
 *
 * Cuando se venda un combo, el sistema debe:
 *
 * 1. Validar disponibilidad:
 *    const validation = validateComboStock(combo.products, quantity)
 *    if (!validation.valid) throw new Error('Stock insuficiente')
 *
 * 2. Descontar stock de cada producto individual:
 *    for (const comboProduct of combo.products) {
 *      await prisma.productVariant.update({
 *        where: { id: comboProduct.variantId },
 *        data: {
 *          stock: {
 *            decrement: comboProduct.quantity * quantity
 *          }
 *        }
 *      })
 *    }
 *
 * 3. Registrar en OrderItem con comboId:
 *    await prisma.orderItem.create({
 *      data: {
 *        orderId,
 *        comboId: combo.id,
 *        productName: combo.name,
 *        price: combo.price,
 *        quantity,
 *        subtotal: combo.price * quantity
 *      }
 *    })
 *
 * NOTA: El descuento de stock debe hacerse dentro de una transacción de Prisma
 * para garantizar atomicidad y evitar problemas de concurrencia.
 */

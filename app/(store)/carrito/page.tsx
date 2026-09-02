'use client'

import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'

export default function CarritoPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart()

  if (items.length === 0) {
    return (
      <div className="relative bg-black min-h-screen">
        <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-black to-black animate-gradient-shift -z-10"></div>

        <div className="relative z-10 pt-32 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <ShoppingBag className="w-24 h-24 text-gray-600 mx-auto mb-6" />
              <h2 className="text-3xl font-black text-white mb-4">
                Tu carrito está vacío
              </h2>
              <p className="text-gray-400 mb-8">
                Agregá productos para comenzar tu compra
              </p>
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-all"
              >
                Ver Productos
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-black min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-black to-black animate-gradient-shift -z-10"></div>

      <div className="relative z-10 pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Seguir comprando
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              Carrito de Compras
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const itemId = item.variantId || item.comboId || ''
                const itemLink = item.isCombo ? `/combos/${item.comboSlug}` : `/productos/${item.productSlug}`

                return (
                  <div
                    key={itemId}
                    className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-green-500/50 transition-all"
                  >
                    <div className="flex gap-4">
                      <Link
                        href={itemLink}
                        className="relative w-24 h-24 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0"
                      >
                        {item.image ? (
                          <Image src={item.image} alt={item.productName} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                            Sin imagen
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <Link href={itemLink} className="flex-1 font-bold text-white hover:text-green-400 transition-colors line-clamp-2">
                            {item.productName}
                          </Link>
                          {item.isCombo && (
                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                              COMBO
                            </span>
                          )}
                        </div>

                        {item.productBrand && <p className="text-sm text-gray-400">{item.productBrand}</p>}

                        {!item.isCombo && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.capacity && <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">{item.capacity}</span>}
                            {item.size && <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">{item.size}</span>}
                            {item.power && <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">{item.power}</span>}
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-lg font-black text-green-400">
                            ${(item.price * item.quantity).toLocaleString('es-AR')}
                          </span>

                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(itemId, item.quantity - 1)} className="p-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded transition-all" disabled={item.quantity <= 1}>
                              <Minus className="w-4 h-4" />
                            </button>
                          <span className="w-12 text-center font-semibold text-white">{item.quantity}</span>
                          <button onClick={() => updateQuantity(itemId, item.quantity + 1)} className="p-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded transition-all" disabled={item.quantity >= item.maxStock}>
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {item.quantity >= item.maxStock && <p className="text-xs text-yellow-400 mt-1">Stock máximo alcanzado</p>}
                    </div>

                    <button onClick={() => removeItem(itemId)} className="p-2 text-gray-400 hover:text-red-500 transition-colors self-start">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                )
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-bold text-white mb-6">Resumen</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal</span>
                    <span className="font-semibold">${totalPrice.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="border-t border-gray-800 pt-3">
                    <div className="flex justify-between text-white">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-black text-2xl text-green-400">${totalPrice.toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </div>
                <Link href="/checkout" className="block w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-center rounded-xl hover:scale-105 transition-all shadow-lg hover:shadow-green-500/50">
                  Finalizar Compra
                </Link>
                <p className="text-xs text-gray-500 text-center mt-4">Envío calculado en el checkout</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

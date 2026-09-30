'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Check } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [checkoutComplete, setCheckoutComplete] = useState(false)
  const [calculatingShipping, setCalculatingShipping] = useState(false)
  const [shippingRates, setShippingRates] = useState<any[]>([])
  const [selectedShipping, setSelectedShipping] = useState<any>(null)
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingType: 'SHIPPING' as 'SHIPPING' | 'PICKUP' | 'ARRANGEMENT',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    notes: '',
  })

  useEffect(() => {
    if (items.length === 0 && !loading && !checkoutComplete) {
      router.push('/carrito')
    }
  }, [items.length, loading, checkoutComplete, router])

  const calculateShipping = async () => {
    if (!formData.postalCode || formData.postalCode.length < 4) {
      alert('Por favor ingresa un código postal válido')
      return
    }

    setCalculatingShipping(true)
    try {
      const response = await fetch('/api/shipments/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origenCP: process.env.NEXT_PUBLIC_STORE_POSTAL_CODE || '1884', // Berazategui
          destinoCP: formData.postalCode,
          peso: 1000, // 1kg default
          valorDeclarado: totalPrice,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.rates) {
          // APLICAR MARKUP DEL 100% (DOBLE) AL PRECIO QUE VE EL CLIENTE
          const ratesWithMarkup = data.rates.map((rate: any) => ({
            ...rate,
            precioReal: rate.precio, // Guardar precio real (costo del correo)
            precio: rate.precio * 2, // Precio con 100% markup (lo que paga el cliente)
          }))
          setShippingRates(ratesWithMarkup)
          // Auto-seleccionar la opción más económica
          if (ratesWithMarkup.length > 0) {
            setSelectedShipping(ratesWithMarkup[0])
          }
        } else {
          alert('No se pudieron obtener las tarifas de envío')
        }
      }
    } catch (error) {
      console.error('Error al calcular envío:', error)
      alert('Error al calcular envío')
    } finally {
      setCalculatingShipping(false)
    }
  }

  const finalTotal = selectedShipping && formData.shippingType === 'SHIPPING'
    ? totalPrice + selectedShipping.precio // Ya incluye el markup del 100%
    : totalPrice

  const realShippingCost = selectedShipping && formData.shippingType === 'SHIPPING'
    ? selectedShipping.precioReal || selectedShipping.precio / 2 // Costo real sin markup
    : 0

  if (items.length === 0) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // El servidor calcula precios, stock y costo de envío
          items: items.map(item => ({
            variantId: item.variantId,
            comboId: item.comboId,
            quantity: item.quantity,
          })),
          shippingService: formData.shippingType === 'SHIPPING' ? selectedShipping?.servicio : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        alert(data?.error || 'Error al procesar tu pedido')
        return
      }

      const order = await response.json()
      const message = generateWhatsAppMessage(order)

      // Marcar checkout como completo para evitar redirección al carrito
      setCheckoutComplete(true)

      // Abrir WhatsApp inmediatamente
      window.open(`https://wa.me/5491135781844?text=${encodeURIComponent(message)}`, '_blank')

      // Limpiar carrito
      clearCart()

      // Redirigir a página de confirmación
      router.push(`/pedido-confirmado?orden=${order.orderNumber}`)
    } catch {
      alert('Error al procesar tu pedido')
    } finally {
      setLoading(false)
    }
  }

  const generateWhatsAppMessage = (order: any) => {
    let msg = `🛒 NUEVO PEDIDO - ${order.orderNumber}\n\n`
    msg += `👤 Cliente: ${formData.customerName}\n📧 ${formData.customerEmail}\n📱 ${formData.customerPhone}\n\n📦 Productos:\n`
    order.items.forEach((item: any, i: number) => {
      msg += `${i + 1}. ${item.productName} x${item.quantity} - $${item.subtotal.toLocaleString('es-AR')}\n`
    })
    msg += `\n💰 Subtotal: $${order.subtotal.toLocaleString('es-AR')}\n`
    if (formData.shippingType === 'SHIPPING') {
      msg += `📍 Envío a: ${formData.address}, ${formData.city}, ${formData.province} (CP: ${formData.postalCode})\n`
      if (selectedShipping) {
        msg += `🚚 Tipo: ${selectedShipping.servicio} - $${order.shippingCost.toLocaleString('es-AR')}\n`
      }
    } else if (formData.shippingType === 'PICKUP') {
      msg += `🤝 Punto de encuentro\n`
    } else if (formData.shippingType === 'ARRANGEMENT') {
      msg += `⚡ Envío express (Zona Sur y CABA)\n`
    }
    msg += `\n💵 TOTAL: $${order.total.toLocaleString('es-AR')}\n`
    if (formData.notes) msg += `\n📝 Notas: ${formData.notes}`
    return msg
  }
  return (
    <div className="relative bg-black min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-black to-black animate-gradient-shift -z-10"></div>
      <div className="relative z-10 pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/carrito" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Volver al carrito
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-8">Finalizar Compra</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Datos de Contacto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Nombre completo *</label>
                  <input type="text" required value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Email *</label>
                  <input type="email" required value={formData.customerEmail} onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Teléfono *</label>
                  <input type="tel" required value={formData.customerPhone} onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Método de Entrega</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.shippingType === 'SHIPPING' ? 'border-green-500 bg-green-500/10' : 'border-gray-700'}`}>
                  <input type="radio" name="shipping" value="SHIPPING" checked={formData.shippingType === 'SHIPPING'} onChange={() => setFormData({ ...formData, shippingType: 'SHIPPING' })} className="w-5 h-5 accent-green-500" />
                  <div><p className="font-semibold text-white">Envío a domicilio</p></div>
                </label>
                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.shippingType === 'PICKUP' ? 'border-green-500 bg-green-500/10' : 'border-gray-700'}`}>
                  <input type="radio" name="shipping" value="PICKUP" checked={formData.shippingType === 'PICKUP'} onChange={() => setFormData({ ...formData, shippingType: 'PICKUP' })} className="w-5 h-5 accent-green-500" />
                  <div><p className="font-semibold text-white">Punto de encuentro</p></div>
                </label>
                <label className={`flex flex-col gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.shippingType === 'ARRANGEMENT' ? 'border-green-500 bg-green-500/10' : 'border-gray-700'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" value="ARRANGEMENT" checked={formData.shippingType === 'ARRANGEMENT'} onChange={() => setFormData({ ...formData, shippingType: 'ARRANGEMENT' })} className="w-5 h-5 accent-green-500" />
                    <p className="font-semibold text-white">Envío express</p>
                  </div>
                  <p className="text-xs text-gray-400 ml-8">Zona Sur y CABA</p>
                </label>
              </div>
              {formData.shippingType === 'SHIPPING' && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Dirección *</label>
                      <input type="text" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Ciudad *</label>
                      <input type="text" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Provincia *</label>
                      <input type="text" required value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value })} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Código Postal *</label>
                      <input type="text" required value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500" placeholder="1425" />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={calculateShipping}
                        disabled={calculatingShipping || !formData.postalCode}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {calculatingShipping ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Calculando...
                          </span>
                        ) : (
                          'Calcular Envío'
                        )}
                      </button>
                    </div>
                  </div>

                  {shippingRates.length > 0 && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                      <h3 className="text-sm font-bold text-white mb-3">Opciones de Envío</h3>
                      <div className="space-y-2">
                        {shippingRates.map((rate: any, index: number) => (
                          <label
                            key={index}
                            className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedShipping?.servicio === rate.servicio
                                ? 'border-green-500 bg-green-500/10'
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="shippingService"
                                checked={selectedShipping?.servicio === rate.servicio}
                                onChange={() => setSelectedShipping(rate)}
                                className="w-4 h-4 accent-green-500"
                              />
                              <div>
                                <p className="font-semibold text-white capitalize">{rate.servicio}</p>
                                <p className="text-xs text-gray-400">{rate.diasEntrega} días hábiles</p>
                              </div>
                            </div>
                            <span className="font-bold text-green-400">${rate.precio.toLocaleString('es-AR')}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Notas (opcional)</h2>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 resize-none" />
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Resumen</h2>
              <div className="space-y-2 mb-4">
                {items.map(item => {
                  const itemId = item.variantId || item.comboId || ''
                  return (
                    <div key={itemId} className="flex justify-between text-sm">
                      <span className="text-gray-300">
                        {item.productName} x{item.quantity}
                        {item.isCombo && <span className="ml-1 text-xs text-green-400">(COMBO)</span>}
                      </span>
                      <span className="text-white font-semibold">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                    </div>
                  )
                })}
              </div>
              <div className="border-t border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>${totalPrice.toLocaleString('es-AR')}</span>
                </div>
                {selectedShipping && formData.shippingType === 'SHIPPING' && (
                  <div className="flex justify-between text-gray-300">
                    <span>Envío ({selectedShipping.servicio})</span>
                    <span>${selectedShipping.precio.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="border-t border-gray-700 pt-2 flex justify-between">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-black text-2xl text-green-400">${finalTotal.toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Procesando...</>) : (<><Check className="w-5 h-5" />Confirmar por WhatsApp</>)}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

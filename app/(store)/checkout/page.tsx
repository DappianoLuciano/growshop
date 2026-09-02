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
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingType: 'SHIPPING' as 'SHIPPING' | 'PICKUP',
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
          items: items.map(item => ({
            variantId: item.variantId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: totalPrice,
          total: totalPrice,
        }),
      })

      if (!response.ok) throw new Error('Error')

      const order = await response.json()
      const message = generateWhatsAppMessage(order)

      // Marcar checkout como completo para evitar redirección al carrito
      setCheckoutComplete(true)

      // Abrir WhatsApp inmediatamente
      window.open(`https://wa.me/5491136295630?text=${encodeURIComponent(message)}`, '_blank')

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
    let msg = `NUEVO PEDIDO - ${order.orderNumber}\n\n`
    msg += `Cliente: ${formData.customerName}\n${formData.customerEmail}\n${formData.customerPhone}\n\nProductos:\n`
    items.forEach((item, i) => {
      msg += `${i + 1}. ${item.productName} x${item.quantity} - $${(item.price * item.quantity).toLocaleString('es-AR')}\n`
    })
    msg += `\nTotal: $${totalPrice.toLocaleString('es-AR')}\n\n`
    if (formData.shippingType === 'SHIPPING') {
      msg += `Envío: ${formData.address}, ${formData.city}, ${formData.province}\n`
    } else {
      msg += `Retiro en local\n`
    }
    if (formData.notes) msg += `\nNotas: ${formData.notes}`
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.shippingType === 'SHIPPING' ? 'border-green-500 bg-green-500/10' : 'border-gray-700'}`}>
                  <input type="radio" name="shipping" value="SHIPPING" checked={formData.shippingType === 'SHIPPING'} onChange={() => setFormData({ ...formData, shippingType: 'SHIPPING' })} className="w-5 h-5 accent-green-500" />
                  <div><p className="font-semibold text-white">Envío a domicilio</p></div>
                </label>
                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.shippingType === 'PICKUP' ? 'border-green-500 bg-green-500/10' : 'border-gray-700'}`}>
                  <input type="radio" name="shipping" value="PICKUP" checked={formData.shippingType === 'PICKUP'} onChange={() => setFormData({ ...formData, shippingType: 'PICKUP' })} className="w-5 h-5 accent-green-500" />
                  <div><p className="font-semibold text-white">Retiro en local</p></div>
                </label>
              </div>
              {formData.shippingType === 'SHIPPING' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              <div className="border-t border-gray-700 pt-4 flex justify-between">
                <span className="font-bold text-white">Total</span>
                <span className="font-black text-2xl text-green-400">${totalPrice.toLocaleString('es-AR')}</span>
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

'use client'
import { useState, useEffect, use } from 'react'
import { ArrowLeft, Check, Loader2, Trash2, Truck, Package, Ban, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import ConfirmModal from '@/components/admin/ConfirmModal'

// Los Decimal de Prisma llegan como string en el JSON; se usan con parseFloat/toString
interface OrderItem {
  id: string
  productName: string
  quantity: number
  price: number
  variant?: { product?: { images?: { url: string }[] } } | null
}

interface OrderDetail {
  id: string
  orderNumber: string
  createdAt: string
  status: string
  paymentStatus: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingType: string
  address: string | null
  city: string | null
  province: string | null
  postalCode: string | null
  subtotal: number
  shippingCost: number
  total: number
  trackingNumber: string | null
  ocaTrackingData?: { estimatedDelivery?: string } | null
  items: OrderItem[]
}

interface ShipmentResult {
  shipment?: { trackingNumber?: string; cost?: number; label?: string; estimatedDelivery?: string }
  profit?: { amount?: number }
}

export default function OrdenDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [shipmentModalOpen, setShipmentModalOpen] = useState(false)
  const [generatingShipment, setGeneratingShipment] = useState(false)
  const [shipmentData, setShipmentData] = useState<ShipmentResult | null>(null)
  const [trackingModalOpen, setTrackingModalOpen] = useState(false)
  const [manualTracking, setManualTracking] = useState('')
  const [savingTracking, setSavingTracking] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [reopenModalOpen, setReopenModalOpen] = useState(false)

  // Subir reloadKey vuelve a pedir la orden (después de aprobar, cancelar, etc.)
  const [reloadKey, setReloadKey] = useState(0)
  const fetchOrder = () => setReloadKey(k => k + 1)

  useEffect(() => {
    let cancelled = false
    async function loadOrder() {
      try {
        const response = await fetch(`/api/orders/${resolvedParams.id}`)
        if (response.ok && !cancelled) setOrder(await response.json())
      } catch (error) {
        console.error(error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadOrder()
    return () => { cancelled = true }
  }, [resolvedParams.id, reloadKey])

  // PATCH de la orden; muestra el error del servidor si falla (ej: falta de stock)
  const updateOrder = async (changes: Record<string, string>) => {
    try {
      const response = await fetch(`/api/orders/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      })
      if (response.ok) {
        fetchOrder()
        return true
      }
      const data = await response.json().catch(() => ({}))
      alert(data.error || 'No se pudo actualizar la orden')
    } catch (error) {
      console.error('Error al actualizar orden:', error)
      alert('No se pudo actualizar la orden')
    }
    return false
  }

  const handleApprovePayment = async () => {
    if (await updateOrder({ paymentStatus: 'APPROVED' })) setSuccessModalOpen(true)
  }

  const isCancelled = order?.status === 'CANCELLED'
  const canCancel = order && !['CANCELLED', 'DELIVERED'].includes(order.status)

  const handleDeleteOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${resolvedParams.id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        router.push('/admin/ordenes')
      }
    } catch (error) {
      console.error('Error al eliminar orden:', error)
    }
  }

  const handleGenerateShipment = async () => {
    setGeneratingShipment(true)
    try {
      const response = await fetch('/api/shipments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: resolvedParams.id,
          servicio: 'clasico',
          peso: 1000,
          dimensiones: { alto: 10, ancho: 20, largo: 30 },
          remitente: {
            nombre: process.env.NEXT_PUBLIC_STORE_NAME || 'GrowShop',
            direccion: process.env.NEXT_PUBLIC_STORE_ADDRESS || 'Berazategui, Buenos Aires',
            localidad: 'Berazategui',
            provincia: 'Buenos Aires',
            codigoPostal: process.env.NEXT_PUBLIC_STORE_POSTAL_CODE || '1884',
            telefono: process.env.NEXT_PUBLIC_STORE_PHONE || '1135781844'
          }
        }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setShipmentData(data)
        fetchOrder()
        setShipmentModalOpen(true)
      } else {
        alert(`Error: ${data.error || 'No se pudo generar el envío'}`)
      }
    } catch (error) {
      console.error('Error al generar envío:', error)
      alert('Error al generar envío')
    } finally {
      setGeneratingShipment(false)
    }
  }

  const handleSaveManualTracking = async () => {
    if (!order) return
    if (!manualTracking.trim()) {
      alert('Ingresa un número de tracking')
      return
    }

    setSavingTracking(true)
    try {
      const response = await fetch(`/api/orders/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber: manualTracking.trim(),
          status: 'SHIPPED'
        }),
      })

      if (response.ok) {
        fetchOrder()
        setTrackingModalOpen(false)

        // Generar mensaje de WhatsApp con el tracking
        const trackingMsg = `¡Hola ${order.customerName}! 👋

Tu pedido *${order.orderNumber}* ya está en camino 📦

🔍 *Número de seguimiento:*
${manualTracking.trim()}

📍 *Podés rastrearlo acá:*
https://www.correoargentino.com.ar/formularios/e-tracking

Ingresá el número de seguimiento en la web para ver el estado de tu envío.

¡Gracias por tu compra! 🌱`

        // Abrir WhatsApp con el mensaje
        const phone = order.customerPhone.replace(/\D/g, '')
        const whatsappUrl = `https://wa.me/${phone.startsWith('54') ? phone : '54' + phone}?text=${encodeURIComponent(trackingMsg)}`
        window.open(whatsappUrl, '_blank')

        setManualTracking('')
      } else {
        const data = await response.json().catch(() => ({}))
        alert(data.error || 'Error al guardar tracking')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar tracking')
    } finally {
      setSavingTracking(false)
    }
  }

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 text-green-500 animate-spin" /></div>
  if (!order) return <div className="p-8 text-center text-gray-400">Orden no encontrada</div>

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/ordenes" className="p-2 text-gray-400 hover:text-white"><ArrowLeft className="w-6 h-6" /></Link>
        <div className="flex-1">
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3 flex-wrap">
            Orden {order.orderNumber}
            {isCancelled && (
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-500/20 text-red-400">CANCELADA</span>
            )}
          </h1>
          <p className="text-gray-400">{new Date(order.createdAt).toLocaleString('es-AR')}</p>
        </div>
        <div className="flex items-center gap-3">
          {order.paymentStatus === 'PENDING' && !isCancelled && (
            <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-all">
              <Check className="w-5 h-5" />Aprobar Pago
            </button>
          )}
          {order.paymentStatus === 'APPROVED' && !isCancelled && order.shippingType === 'SHIPPING' && !order.trackingNumber && (
            <>
              <button
                onClick={handleGenerateShipment}
                disabled={generatingShipment}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingShipment ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Generando...</>
                ) : (
                  <><Truck className="w-5 h-5" />Generar Envío Auto</>
                )}
              </button>
              <button
                onClick={() => setTrackingModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:scale-105 transition-all"
              >
                <Package className="w-5 h-5" />
                Ingresar Tracking
              </button>
            </>
          )}
          {canCancel && (
            <button onClick={() => setCancelModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-red-500/50 text-red-400 font-bold rounded-xl hover:scale-105 transition-all">
              <Ban className="w-5 h-5" />Cancelar Pedido
            </button>
          )}
          {isCancelled && (
            <button onClick={() => setReopenModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-200 font-bold rounded-xl hover:scale-105 transition-all">
              <RotateCcw className="w-5 h-5" />Reabrir
            </button>
          )}
          <button onClick={() => setDeleteModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl hover:scale-105 transition-all">
            <Trash2 className="w-5 h-5" />Eliminar
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Productos</h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-800">
                  <div className="relative w-20 h-20 bg-gray-800 rounded-lg overflow-hidden">
                    {item.variant?.product?.images?.[0] ? (
                      <Image src={item.variant.product.images[0].url} alt={item.productName} fill className="object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Sin img</div>}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">{item.productName}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-400">x{item.quantity}</span>
                      <span className="font-bold text-green-400">${(parseFloat(item.price.toString()) * item.quantity).toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Cliente</h2>
            <div className="space-y-3">
              <div><p className="text-sm text-gray-400">Nombre</p><p className="text-white font-semibold">{order.customerName}</p></div>
              <div><p className="text-sm text-gray-400">Email</p><p className="text-white">{order.customerEmail}</p></div>
              <div><p className="text-sm text-gray-400">Telefono</p><p className="text-white">{order.customerPhone}</p></div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Entrega</h2>
            {order.shippingType === 'SHIPPING' ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Dirección</p>
                  <p className="text-white">{order.address}</p>
                  <p className="text-white">{order.city}, {order.province}</p>
                  <p className="text-white">CP: {order.postalCode}</p>
                </div>
                {order.trackingNumber && (
                  <div className="pt-3 border-t border-gray-800">
                    <p className="text-sm text-gray-400">Tracking</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Package className="w-4 h-4 text-blue-400" />
                      <p className="text-blue-400 font-mono font-bold">{order.trackingNumber}</p>
                    </div>
                    {order.shippingCost > 0 && (
                      <p className="text-sm text-gray-400 mt-2">Costo: ${parseFloat(order.shippingCost.toString()).toLocaleString('es-AR')}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-white">Retiro en local</p>
            )}
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Total</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>${parseFloat(order.subtotal.toString()).toLocaleString('es-AR')}</span>
              </div>
              {order.shippingCost > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span>Envío</span>
                  <span>${parseFloat(order.shippingCost.toString()).toLocaleString('es-AR')}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-800 flex justify-between">
                <span className="font-bold text-white">Total</span>
                <span className="font-black text-2xl text-green-400">${parseFloat(order.total.toString()).toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>

          {order.trackingNumber && (
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-blue-300 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Información de Envío
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-blue-300/70">Número de Seguimiento</p>
                  <p className="text-blue-200 font-mono font-bold text-lg">{order.trackingNumber}</p>
                </div>
                {order.shippingCost > 0 && (
                  <>
                    <div className="pt-2 border-t border-blue-700/30">
                      <p className="text-sm text-blue-300/70">Costo de Envío</p>
                      <p className="text-blue-200 font-bold text-xl">${parseFloat(order.shippingCost.toString()).toLocaleString('es-AR')}</p>
                    </div>
                    <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-3 mt-2">
                      <p className="text-sm text-green-300/70">Ganancia Generada (2x costo)</p>
                      <p className="text-green-400 font-black text-2xl">${(parseFloat(order.shippingCost.toString()) * 2).toLocaleString('es-AR')}</p>
                    </div>
                  </>
                )}
                {order.ocaTrackingData?.estimatedDelivery && (
                  <div className="pt-2">
                    <p className="text-sm text-blue-300/70">Entrega Estimada</p>
                    <p className="text-blue-200">{new Date(order.ocaTrackingData.estimatedDelivery).toLocaleDateString('es-AR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleApprovePayment}
        title="Confirmar Pago"
        message="¿Confirmar que el pago fue recibido? Esta acción descontará el stock de los productos. Si después cancelás el pedido, el stock se devuelve."
        confirmText="Aprobar Pago"
        cancelText="Cancelar"
        type="success"
      />

      <ConfirmModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        onConfirm={() => setSuccessModalOpen(false)}
        title="¡Pago Aprobado!"
        message="El pago fue aprobado exitosamente y el stock fue descontado."
        confirmText="Entendido"
        cancelText=""
        type="success"
      />

      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={() => updateOrder({ status: 'CANCELLED' })}
        title="Cancelar Pedido"
        message={order.paymentStatus === 'APPROVED'
          ? '¿Cancelar este pedido? El pago estaba aprobado: el stock de los productos se va a devolver. Acordate de devolverle el dinero al cliente.'
          : '¿Cancelar este pedido? Queda registrado como cancelado y se puede reabrir más tarde.'}
        confirmText="Cancelar Pedido"
        cancelText="Volver"
        type="danger"
      />

      <ConfirmModal
        isOpen={reopenModalOpen}
        onClose={() => setReopenModalOpen(false)}
        onConfirm={() => updateOrder({ status: 'PENDING' })}
        title="Reabrir Pedido"
        message={order.paymentStatus === 'APPROVED'
          ? '¿Reabrir este pedido? Como el pago está aprobado, se va a volver a descontar el stock.'
          : '¿Reabrir este pedido? Vuelve a quedar pendiente.'}
        confirmText="Reabrir"
        cancelText="Volver"
        type="warning"
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteOrder}
        title="Eliminar Orden"
        message="¿Estás seguro de que deseas eliminar esta orden? Si está aprobada, el stock será devuelto. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      <ConfirmModal
        isOpen={shipmentModalOpen}
        onClose={() => setShipmentModalOpen(false)}
        onConfirm={() => {
          if (shipmentData?.shipment?.label) {
            window.open(shipmentData.shipment.label, '_blank')
          }
          setShipmentModalOpen(false)
        }}
        title="¡Envío Generado!"
        message={shipmentData ? (
          <div className="space-y-2 text-left">
            <p><strong>Tracking:</strong> {shipmentData.shipment?.trackingNumber}</p>
            <p><strong>Costo:</strong> ${shipmentData.shipment?.cost?.toLocaleString('es-AR')}</p>
            <p><strong>Ganancia registrada:</strong> ${shipmentData.profit?.amount?.toLocaleString('es-AR')} (2x el costo)</p>
            {shipmentData.shipment?.estimatedDelivery && (
              <p><strong>Entrega estimada:</strong> {new Date(shipmentData.shipment.estimatedDelivery).toLocaleDateString('es-AR')}</p>
            )}
          </div>
        ) : ''}
        confirmText={shipmentData?.shipment?.label ? "Ver Etiqueta" : "Cerrar"}
        cancelText=""
        type="success"
      />

      {/* Modal Ingresar Tracking Manual */}
      {trackingModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">📦 Ingresar Tracking Number</h3>
            <p className="text-gray-400 text-sm mb-4">
              Ingresá el número de seguimiento que te dio el correo
            </p>
            <input
              type="text"
              value={manualTracking}
              onChange={(e) => setManualTracking(e.target.value)}
              placeholder="AR123456789"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:border-orange-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setTrackingModalOpen(false)
                  setManualTracking('')
                }}
                className="flex-1 px-4 py-3 bg-gray-800 text-gray-300 font-bold rounded-xl hover:bg-gray-700 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveManualTracking}
                disabled={savingTracking || !manualTracking.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {savingTracking ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

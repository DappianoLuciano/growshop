'use client'
import { useState, useEffect, use } from 'react'
import { ArrowLeft, Check, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import ConfirmModal from '@/components/admin/ConfirmModal'

export default function OrdenDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  useEffect(() => { fetchOrder() }, [])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${resolvedParams.id}`)
      if (response.ok) setOrder(await response.json())
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprovePayment = async () => {
    try {
      const response = await fetch(`/api/orders/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'APPROVED' }),
      })
      if (response.ok) {
        fetchOrder()
        setSuccessModalOpen(true)
      }
    } catch (error) {
      console.error('Error al aprobar pago:', error)
    }
  }

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

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 text-green-500 animate-spin" /></div>
  if (!order) return <div className="p-8 text-center text-gray-400">Orden no encontrada</div>

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/ordenes" className="p-2 text-gray-400 hover:text-white"><ArrowLeft className="w-6 h-6" /></Link>
        <div className="flex-1">
          <h1 className="text-3xl font-black text-white mb-2">Orden {order.orderNumber}</h1>
          <p className="text-gray-400">{new Date(order.createdAt).toLocaleString('es-AR')}</p>
        </div>
        <div className="flex items-center gap-3">
          {order.paymentStatus === 'PENDING' && (
            <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-all">
              <Check className="w-5 h-5" />Aprobar Pago
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
              {order.items?.map((item: any) => (
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
            <p className="text-white">{order.shippingType === 'SHIPPING' ? `Envio: ${order.address}, ${order.city}` : 'Retiro en local'}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Total</h2>
            <div className="flex justify-between">
              <span className="font-bold text-white">Total</span>
              <span className="font-black text-2xl text-green-400">${parseFloat(order.total.toString()).toLocaleString('es-AR')}</span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleApprovePayment}
        title="Confirmar Pago"
        message="¿Confirmar que el pago fue recibido? Esta acción descontará el stock de los productos y no se puede revertir."
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
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteOrder}
        title="Eliminar Orden"
        message="¿Estás seguro de que deseas eliminar esta orden? Si está aprobada, el stock será devuelto. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  )
}

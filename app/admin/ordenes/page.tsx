'use client'

import { useState, useEffect } from 'react'
import { Package, Check, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import ConfirmModal from '@/components/admin/ConfirmModal'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  total: number
  status: string
  paymentStatus: string
  shippingType: string
  trackingNumber?: string
  shippingCost?: number
  ocaTrackingData?: any
  createdAt: string
  items: any[]
}

export default function OrdenesAdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteSuccessModalOpen, setDeleteSuccessModalOpen] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const openApproveModal = (orderId: string) => {
    setSelectedOrderId(orderId)
    setModalOpen(true)
  }

  const openDeleteModal = (orderId: string) => {
    setSelectedOrderId(orderId)
    setDeleteModalOpen(true)
  }

  const handleApprovePayment = async () => {
    if (!selectedOrderId) return

    try {
      const response = await fetch(`/api/orders/${selectedOrderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'APPROVED' }),
      })

      if (response.ok) {
        fetchOrders()
        setSuccessModalOpen(true)
      }
    } catch (error) {
      console.error('Error al aprobar pago:', error)
    }
  }

  const handleDeleteOrder = async () => {
    if (!selectedOrderId) return

    try {
      const response = await fetch(`/api/orders/${selectedOrderId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchOrders()
        setDeleteSuccessModalOpen(true)
      }
    } catch (error) {
      console.error('Error al eliminar orden:', error)
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    if (filter === 'pending') return order.paymentStatus === 'PENDING'
    if (filter === 'approved') return order.paymentStatus === 'APPROVED'
    return true
  })

  const getStatusBadge = (status: string) => {
    const colors: any = {
      PENDING: 'bg-yellow-500/20 text-yellow-400',
      APPROVED: 'bg-green-500/20 text-green-400',
      REJECTED: 'bg-red-500/20 text-red-400',
    }
    return colors[status] || 'bg-gray-500/20 text-gray-400'
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Órdenes</h1>
          <p className="text-gray-400">Gestiona los pedidos de los clientes</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl">
          <Package className="w-5 h-5 text-green-500" />
          <span className="text-white font-bold">{orders.length}</span>
          <span className="text-gray-400 text-sm">órdenes</span>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 sticky top-16 z-20 bg-black pt-2 -mt-2">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${filter === 'all' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-300'}`}>
          Todas
        </button>
        <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-800 text-gray-300'}`}>
          Pendientes
        </button>
        <button onClick={() => setFilter('approved')} className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${filter === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-300'}`}>
          Aprobadas
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div>
          <table className="w-full table-fixed">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 w-[160px]">Orden</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 w-[130px]">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 w-[180px]">Contacto</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 w-[100px]">Total</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 w-[130px]">Envío</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 w-[100px]">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 w-[90px]">Fecha</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-300 w-[100px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">No hay órdenes</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors">
                    <td className="px-6 py-4" onClick={() => window.location.href = `/admin/ordenes/${order.id}`}>
                      <p className="font-mono text-sm text-white">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{order.items?.length || 0} items</p>
                    </td>
                    <td className="px-6 py-4" onClick={() => window.location.href = `/admin/ordenes/${order.id}`}>
                      <p className="text-white font-semibold">{order.customerName}</p>
                    </td>
                    <td className="px-6 py-4" onClick={() => window.location.href = `/admin/ordenes/${order.id}`}>
                      <p className="text-sm text-gray-300">{order.customerPhone}</p>
                      <p className="text-xs text-gray-400">{order.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4" onClick={() => window.location.href = `/admin/ordenes/${order.id}`}>
                      <span className="text-white font-bold">${parseFloat(order.total.toString()).toLocaleString('es-AR')}</span>
                    </td>
                    <td className="px-6 py-4" onClick={() => window.location.href = `/admin/ordenes/${order.id}`}>
                      {order.shippingType === 'SHIPPING' ? (
                        <div>
                          <p className="text-xs text-blue-400 font-semibold">🚚 Envío</p>
                          {order.trackingNumber ? (
                            <p className="text-xs text-green-400 font-mono">{order.trackingNumber}</p>
                          ) : (
                            <p className="text-xs text-gray-400">Sin generar</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-orange-400 font-semibold">🏪 Retiro</p>
                      )}
                    </td>
                    <td className="px-6 py-4" onClick={() => window.location.href = `/admin/ordenes/${order.id}`}>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={() => window.location.href = `/admin/ordenes/${order.id}`}>
                      <p className="text-sm text-gray-300">{new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {order.paymentStatus === 'PENDING' && (
                          <button onClick={(e) => { e.stopPropagation(); openApproveModal(order.id); }} className="p-2 text-gray-400 hover:text-green-500">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); openDeleteModal(order.id); }} className="p-2 text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-400">
            No hay órdenes
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-green-500/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-mono text-sm text-white font-bold mb-1">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">{order.items?.length || 0} items · {new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Cliente</p>
                  <p className="text-white font-semibold">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Contacto</p>
                  <p className="text-sm text-gray-300">{order.customerPhone}</p>
                  <p className="text-xs text-gray-400">{order.customerEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total</p>
                  <p className="text-white font-bold text-lg">${parseFloat(order.total.toString()).toLocaleString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Envío</p>
                  {order.shippingType === 'SHIPPING' ? (
                    <div>
                      <p className="text-sm text-blue-400 font-semibold">🚚 A domicilio</p>
                      {order.trackingNumber && (
                        <p className="text-xs text-green-400 font-mono mt-1">{order.trackingNumber}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-orange-400 font-semibold">🏪 Retiro en local</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/admin/ordenes/${order.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:scale-105 transition-all"
                >
                  Ver Detalle
                </Link>
                {order.paymentStatus === 'PENDING' && (
                  <button
                    onClick={() => openApproveModal(order.id)}
                    className="px-4 py-2 bg-gray-800 hover:bg-green-500/20 text-gray-400 hover:text-green-500 rounded-lg transition-all"
                    title="Aprobar"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => openDeleteModal(order.id)}
                  className="px-4 py-2 bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleApprovePayment}
        title="Confirmar Pago"
        message="¿Confirmar que el pago fue recibido? Esta acción descontará el stock de los productos."
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
        message="¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      <ConfirmModal
        isOpen={deleteSuccessModalOpen}
        onClose={() => setDeleteSuccessModalOpen(false)}
        onConfirm={() => setDeleteSuccessModalOpen(false)}
        title="Orden Eliminada"
        message="La orden fue eliminada exitosamente."
        confirmText="Entendido"
        cancelText=""
        type="success"
      />
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Package, Check, Loader2, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
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
  trackingNumber?: string | null
  createdAt: string
  _count: { items: number }
}

interface OrdersPage {
  orders: Order[]
  total: number
  page: number
  totalPages: number
}

const FILTERS = [
  { value: 'all', label: 'Todas', active: 'bg-green-500 text-white' },
  { value: 'pending', label: 'Pendientes', active: 'bg-yellow-500 text-white' },
  { value: 'approved', label: 'Aprobadas', active: 'bg-green-500 text-white' },
  { value: 'cancelled', label: 'Canceladas', active: 'bg-red-500 text-white' },
]

export default function OrdenesAdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteSuccessModalOpen, setDeleteSuccessModalOpen] = useState(false)

  // Subir reloadKey vuelve a pedir la página actual (después de aprobar o borrar)
  const [reloadKey, setReloadKey] = useState(0)
  const fetchOrders = () => setReloadKey(k => k + 1)

  useEffect(() => {
    let cancelled = false
    async function loadOrders() {
      try {
        const params = new URLSearchParams({ page: String(page), filter })
        if (query) params.set('q', query)
        const response = await fetch(`/api/orders?${params}`)
        if (response.ok && !cancelled) {
          const data: OrdersPage = await response.json()
          // Si se borró el último pedido de la página, volver a la anterior
          if (data.orders.length === 0 && data.page > 1) {
            setPage(data.totalPages)
            return
          }
          setOrders(data.orders)
          setTotal(data.total)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadOrders()
    return () => { cancelled = true }
  }, [page, filter, query, reloadKey])

  // Búsqueda: espera a que se deje de escribir
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  const changeFilter = (value: string) => {
    setFilter(value)
    setPage(1)
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
      } else {
        const data = await response.json().catch(() => ({}))
        alert(data.error || 'No se pudo aprobar el pago')
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

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-500/20 text-yellow-400',
      APPROVED: 'bg-green-500/20 text-green-400',
      REJECTED: 'bg-red-500/20 text-red-400',
      CANCELLED: 'bg-red-500/20 text-red-400',
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
    <div className="p-6 md:p-8 overflow-x-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Órdenes</h1>
          <p className="text-gray-400">Gestiona los pedidos de los clientes</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl">
          <Package className="w-5 h-5 text-green-500" />
          <span className="text-white font-bold">{total}</span>
          <span className="text-gray-400 text-sm">órdenes</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6 sticky top-16 z-20 bg-black pt-2 -mt-2 pb-2">
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => changeFilter(f.value)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${filter === f.value ? f.active : 'bg-gray-800 text-gray-300'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative md:ml-auto md:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por orden, cliente, email o teléfono"
            className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="max-h-[calc(100vh-260px)] overflow-y-auto overflow-x-hidden custom-scrollbar">
          <table className="w-full table-fixed">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-5 text-left text-sm font-bold text-gray-300 w-[160px]">Orden</th>
                <th className="px-6 py-5 text-left text-sm font-bold text-gray-300 w-[130px]">Cliente</th>
                <th className="px-6 py-5 text-left text-sm font-bold text-gray-300 w-[180px]">Contacto</th>
                <th className="px-6 py-5 text-left text-sm font-bold text-gray-300 w-[100px]">Total</th>
                <th className="px-6 py-5 text-left text-sm font-bold text-gray-300 w-[130px]">Envío</th>
                <th className="px-6 py-5 text-left text-sm font-bold text-gray-300 w-[100px]">Estado</th>
                <th className="px-6 py-5 text-left text-sm font-bold text-gray-300 w-[90px]">Fecha</th>
                <th className="px-6 py-5 text-right text-sm font-bold text-gray-300 w-[100px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">No hay órdenes</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-t border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors">
                    <td className="px-6 py-5" onClick={() => window.location.href = `/admin/ordenes/${order.id}`}>
                      <p className="font-mono text-sm text-white">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{order._count.items} items</p>
                    </td>
                    <td className="px-6 py-5" onClick={() => window.location.href = `/admin/ordenes/${order.id}`}>
                      <p className="text-white font-semibold">{order.customerName}</p>
                    </td>
                    <td className="px-6 py-5" onClick={() => window.location.href = `/admin/ordenes/${order.id}`}>
                      <p className="text-sm text-gray-300">{order.customerPhone}</p>
                      <p className="text-xs text-gray-400">{order.customerEmail}</p>
                    </td>
                    <td className="px-6 py-5" onClick={() => window.location.href = `/admin/ordenes/${order.id}`}>
                      <span className="text-white font-bold">${parseFloat(order.total.toString()).toLocaleString('es-AR')}</span>
                    </td>
                    <td className="px-6 py-5" onClick={() => window.location.href = `/admin/ordenes/${order.id}`}>
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
                    <td className="px-6 py-5" onClick={() => window.location.href = `/admin/ordenes/${order.id}`}>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status === 'CANCELLED' ? 'CANCELLED' : order.paymentStatus)}`}>
                        {order.status === 'CANCELLED' ? 'CANCELADA' : order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-5" onClick={() => window.location.href = `/admin/ordenes/${order.id}`}>
                      <p className="text-sm text-gray-300">{new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        {order.paymentStatus === 'PENDING' && order.status !== 'CANCELLED' && (
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
      <div className="lg:hidden space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
        {orders.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-400">
            No hay órdenes
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-green-500/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-mono text-sm text-white font-bold mb-1">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">{order._count.items} items · {new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status === 'CANCELLED' ? 'CANCELLED' : order.paymentStatus)}`}>
                  {order.status === 'CANCELLED' ? 'CANCELADA' : order.paymentStatus}
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
                {order.paymentStatus === 'PENDING' && order.status !== 'CANCELLED' && (
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-400">
            Página <span className="text-white font-semibold">{page}</span> de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Página siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

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

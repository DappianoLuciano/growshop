'use client'

import { Package, ShoppingCart, FolderTree, DollarSign, Loader2, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  totalProducts: number
  totalOrders: number
  totalCategories: number
  totalSales: number
  pendingOrders: number
  approvedOrders: number
}

interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  total: number
  paymentStatus: string
  createdAt: string
}

interface LowStockProduct {
  id: string
  name: string
  stock: number
  slug: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [todaySales, setTodaySales] = useState(0)

  useEffect(() => {
    fetchStats()
    fetchRecentActivity()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/admin/recent-activity')
      if (response.ok) {
        const data = await response.json()
        setRecentOrders(data.recentOrders || [])
        setLowStockProducts(data.lowStockProducts || [])
        setTodaySales(data.todaySales || 0)
      }
    } catch (error) {
      console.error('Error al cargar actividad reciente:', error)
    }
  }

  const statsConfig = [
    { label: 'Total Productos', value: stats?.totalProducts || 0, icon: Package, color: 'from-blue-500 to-blue-600' },
    { label: 'Órdenes Pendientes', value: stats?.pendingOrders || 0, icon: ShoppingCart, color: 'from-yellow-500 to-orange-500', link: '/admin/ordenes' },
    { label: 'Órdenes Aprobadas', value: stats?.approvedOrders || 0, icon: ShoppingCart, color: 'from-green-500 to-emerald-600', link: '/admin/ordenes' },
    { label: 'Ventas del Mes', value: `$${parseFloat(stats?.totalSales?.toString() || '0').toLocaleString('es-AR')}`, icon: DollarSign, color: 'from-purple-500 to-purple-600' },
  ]

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Bienvenido al panel de administración</p>
      </div>

      {/* Quick Actions - Mobile Only (mostrar primero en mobile) */}
      <div className="md:hidden bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 gap-4">
          <Link
            href="/admin/productos/nuevo"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all"
          >
            <Package className="w-5 h-5" />
            Nuevo Producto
          </Link>
          <Link
            href="/admin/categorias/nueva"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-800 text-white font-bold rounded-xl active:scale-95 transition-all"
          >
            <FolderTree className="w-5 h-5" />
            Nueva Categoría
          </Link>
          <Link
            href="/admin/ordenes"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-800 text-white font-bold rounded-xl active:scale-95 transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
            Ver Órdenes
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
              <span className="text-gray-400">Cargando estadísticas...</span>
            </div>
          </div>
        ) : (
          statsConfig.map((stat) => {
            const Icon = stat.icon
            const CardWrapper = stat.link ? 'a' : 'div'
            return (
              <CardWrapper
                key={stat.label}
                href={stat.link}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </CardWrapper>
            )
          })
        )}
      </div>

      {/* Quick Actions - Desktop Only */}
      <div className="hidden md:block bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/productos/nuevo"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-all"
          >
            <Package className="w-5 h-5" />
            Nuevo Producto
          </Link>
          <Link
            href="/admin/categorias/nueva"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all"
          >
            <FolderTree className="w-5 h-5" />
            Nueva Categoría
          </Link>
          <Link
            href="/admin/ordenes"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
            Ver Órdenes
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas Órdenes */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Últimas Órdenes</h2>
            <Link href="/admin/ordenes" className="text-sm text-green-400 hover:text-green-300">
              Ver todas
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No hay órdenes recientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/ordenes/${order.id}`}
                  className="block p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono text-gray-300">{order.orderNumber}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.paymentStatus === 'PENDING'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {order.paymentStatus === 'PENDING' ? 'Pendiente' : 'Aprobado'}
                    </span>
                  </div>
                  <p className="text-white font-semibold mb-1">{order.customerName}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('es-AR')}
                    </span>
                    <span className="text-green-400 font-bold">
                      ${parseFloat(order.total.toString()).toLocaleString('es-AR')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Stock Bajo y Ventas del Día */}
        <div className="space-y-6">
          {/* Ventas del Día */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Ventas de Hoy</h2>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total vendido</p>
                <p className="text-3xl font-black text-white">
                  ${todaySales.toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          </div>

          {/* Productos con Stock Bajo */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-bold text-white">Stock Bajo</h2>
            </div>
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">Todo el stock está bien</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/admin/productos/${product.id}`}
                    className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold text-sm">{product.name}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        product.stock === 0
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {product.stock} unidades
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

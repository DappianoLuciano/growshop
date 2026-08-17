'use client'

import { Package, ShoppingCart, FolderTree, DollarSign, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Stats {
  totalProducts: number
  totalOrders: number
  totalCategories: number
  totalSales: number
  pendingOrders: number
  approvedOrders: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
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
          <a
            href="/admin/productos"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all"
          >
            <Package className="w-5 h-5" />
            Nuevo Producto
          </a>
          <a
            href="/admin/categorias"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-800 text-white font-bold rounded-xl active:scale-95 transition-all"
          >
            <FolderTree className="w-5 h-5" />
            Nueva Categoría
          </a>
          <a
            href="/admin/ordenes"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-800 text-white font-bold rounded-xl active:scale-95 transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
            Ver Órdenes
          </a>
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
          <a
            href="/admin/productos?nuevo=true"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-all"
          >
            <Package className="w-5 h-5" />
            Nuevo Producto
          </a>
          <a
            href="/admin/categorias?nuevo=true"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all"
          >
            <FolderTree className="w-5 h-5" />
            Nueva Categoría
          </a>
          <a
            href="/admin/ordenes"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
            Ver Órdenes
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Actividad Reciente</h2>
        <div className="text-center py-8">
          <p className="text-gray-400">No hay actividad reciente</p>
        </div>
      </div>
    </div>
  )
}

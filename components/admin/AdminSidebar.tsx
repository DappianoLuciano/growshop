'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Settings } from 'lucide-react'

const menuItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/productos', icon: Package, label: 'Productos' },
  { href: '/admin/categorias', icon: FolderTree, label: 'Categorías' },
  { href: '/admin/ordenes', icon: ShoppingCart, label: 'Órdenes' },
  { href: '/admin/configuracion', icon: Settings, label: 'Configuración' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-gray-900 border-r border-gray-800 hidden md:block overflow-y-auto">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

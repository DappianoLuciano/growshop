'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Settings, X } from 'lucide-react'
import { useEffect } from 'react'

const menuItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/productos', icon: Package, label: 'Productos' },
  { href: '/admin/categorias', icon: FolderTree, label: 'Categorías' },
  { href: '/admin/ordenes', icon: ShoppingCart, label: 'Órdenes' },
  { href: '/admin/configuracion', icon: Settings, label: 'Configuración' },
]

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  // Cerrar menú móvil cuando cambia la ruta
  useEffect(() => {
    if (onClose) {
      onClose()
    }
  }, [pathname, onClose])

  // Prevenir scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar desktop y drawer móvil */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:top-16`}
      >
        {/* Header móvil */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-800">
          <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
            MENÚ
          </span>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

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
    </>
  )
}

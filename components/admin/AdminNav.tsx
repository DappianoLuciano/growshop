'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/products', label: 'Productos', icon: '🌱' },
  { href: '/admin/orders', label: 'Pedidos', icon: '📦' },
  { href: '/admin/categories', label: 'Categorías', icon: '🏷️' },
  { href: '/admin/settings', label: 'Configuración', icon: '⚙️' },
]

export default function AdminNav() {
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' })
  }

  return (
    <nav className="bg-white border-b border-grow-gray-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="/images/logo.jpg"
                alt="AGRO.GROW Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold text-grow-text">
              AGRO.GROW
            </span>
            <span className="text-xs bg-grow-green/20 text-grow-text px-2 py-1 rounded">
              Admin
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-grow-green/10 text-grow-green-dark border border-grow-green/20'
                      : 'text-grow-text-light hover:text-grow-text hover:bg-grow-gray-light'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-sm text-grow-text-light hover:text-grow-green-dark transition-colors"
            >
              Ver Tienda →
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-grow-text-light hover:text-red-600 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3 flex gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-grow-green/10 text-grow-green-dark border border-grow-green/20'
                    : 'text-grow-text-light hover:text-grow-text hover:bg-grow-gray-light'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

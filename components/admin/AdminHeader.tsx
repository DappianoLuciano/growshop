'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Menu, LogOut } from 'lucide-react'
import { useState } from 'react'
import { signOut } from 'next-auth/react'

export default function AdminHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/logo.jpg"
                  alt="AGRO.GROW"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
              <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                ADMIN
              </span>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-400 hover:text-white text-sm font-semibold transition-colors"
            >
              Ver Tienda
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-all text-sm font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

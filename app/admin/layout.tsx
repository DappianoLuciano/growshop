'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import SessionProvider from '@/components/admin/SessionProvider'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <SessionProvider>
      <div className="bg-black min-h-screen">
        <AdminHeader onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <div className="flex">
          <AdminSidebar
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />
          <main className="flex-1 ml-0 md:ml-64 pt-16 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}

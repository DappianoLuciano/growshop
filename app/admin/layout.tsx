import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import SessionProvider from '@/components/admin/SessionProvider'
import ProtectedLayout from '@/components/admin/ProtectedLayout'
import { requireAuth } from '@/lib/auth/require-auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificación en el servidor: sin sesión de admin redirige a /login
  // antes de enviar el panel (ProtectedLayout solo lo hace en el navegador)
  await requireAuth()

  return (
    <SessionProvider>
      <ProtectedLayout>
        <div className="bg-black min-h-screen overflow-x-hidden">
          <AdminHeader />
          <div className="flex overflow-x-hidden">
            <AdminSidebar />
            <main className="flex-1 ml-0 md:ml-64 pt-16 px-2 sm:px-4 py-4 overflow-x-hidden max-w-full">
              {children}
            </main>
          </div>
        </div>
      </ProtectedLayout>
    </SessionProvider>
  )
}

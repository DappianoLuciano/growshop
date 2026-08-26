import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import SessionProvider from '@/components/admin/SessionProvider'
import ProtectedLayout from '@/components/admin/ProtectedLayout'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <ProtectedLayout>
        <div className="bg-black min-h-screen">
          <AdminHeader />
          <div className="flex">
            <AdminSidebar />
            <main className="flex-1 ml-0 md:ml-64 pt-16 p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </ProtectedLayout>
    </SessionProvider>
  )
}

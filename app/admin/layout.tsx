import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import SessionProvider from '@/components/admin/SessionProvider'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className="bg-black min-h-screen">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 ml-0 md:ml-64 pt-16">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}

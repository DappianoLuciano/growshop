'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
          <span className="text-gray-400">Verificando sesión...</span>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
          <span className="text-gray-400">Redirigiendo...</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

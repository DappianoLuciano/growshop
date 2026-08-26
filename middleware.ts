import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirigir /admin a /admin/dashboard
  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // Proteger rutas de admin (redundante con layout, pero por seguridad)
  if (pathname.startsWith('/admin')) {
    const session = await auth()
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Proteger APIs de admin
  if (pathname.startsWith('/api/admin')) {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Obtener el token de sesión de las cookies
  const token = request.cookies.get('authjs.session-token') ||
                request.cookies.get('__Secure-authjs.session-token')

  const isLoggedIn = !!token

  // Proteger rutas de admin
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Si está logueado y va a /login, redirigir a admin
  if (pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}

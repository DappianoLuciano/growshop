import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirigir /admin a /admin/dashboard
  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin'],
}

// NOTA DE SEGURIDAD:
// La autenticación se verifica en:
// - app/admin/layout.tsx (requireAuth para todas las páginas admin)
// - Cada API endpoint de admin (auth() en cada route.ts)
// El middleware solo maneja redirecciones, no autenticación
// (auth() no funciona en Edge Runtime de Vercel)

import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import { auth } from './auth'

export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN']

export function isAdmin(session: Session | null): session is Session {
  return Boolean(session?.user && ADMIN_ROLES.includes(session.user.role as string))
}

type AdminCheck =
  | { session: Session; error?: never }
  | { session?: never; error: NextResponse }

/**
 * Verifica la sesión y el rol de admin en API routes.
 * Uso:
 *   const { session, error } = await requireAdminApi()
 *   if (error) return error
 */
export async function requireAdminApi(): Promise<AdminCheck> {
  const session = await auth()
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }
  }
  if (!isAdmin(session)) {
    return { error: NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 }) }
  }
  return { session }
}

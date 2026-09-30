import { auth } from './auth'
import { redirect } from 'next/navigation'
import { isAdmin } from './require-admin'

export async function requireAuth() {
  const session = await auth()

  if (!isAdmin(session)) {
    redirect('/login')
  }

  return session
}

import type { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { rateLimit, isRateLimited, getClientIp } from '@/lib/rate-limit'

const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_PER_EMAIL = 5
const LOGIN_MAX_PER_IP = 20

export const authConfig: NextAuthConfig = {
  trustHost: true, // Necesario para Vercel
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = String(credentials.email).trim()
        const emailKey = `login-email:${email.toLowerCase()}`
        const ipKey = `login-ip:${getClientIp(request.headers)}`

        // Frena fuerza bruta: se revisa antes de consultar la base
        if (isRateLimited(emailKey, LOGIN_MAX_PER_EMAIL) || isRateLimited(ipKey, LOGIN_MAX_PER_IP)) {
          console.warn(`Login bloqueado por demasiados intentos (${emailKey}, ${ipKey})`)
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          })

          const isPasswordValid = user
            ? await compare(credentials.password as string, user.password)
            : false

          if (!user || !isPasswordValid) {
            // Solo los intentos fallidos cuentan para el límite
            rateLimit(emailKey, LOGIN_MAX_PER_EMAIL, LOGIN_WINDOW_MS)
            rateLimit(ipKey, LOGIN_MAX_PER_IP, LOGIN_WINDOW_MS)
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Error en authorize:', error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
}

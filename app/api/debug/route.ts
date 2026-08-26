import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()

    // Test environment variables
    const envCheck = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'SET' : 'MISSING',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
    }

    return NextResponse.json({
      status: 'ok',
      database: {
        connected: true,
        userCount,
      },
      env: envCheck,
      nodeVersion: process.version,
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}

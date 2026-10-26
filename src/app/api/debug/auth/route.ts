import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/server'

export async function GET() {
  try {
    // Test Neon Auth connectivity
    const { data: session } = await auth.getSession()
    
    return Response.json({
      ok: true,
      neonAuthConfigured: !!process.env.NEON_AUTH_BASE_URL,
      cookieSecretConfigured: !!process.env.NEON_AUTH_COOKIE_SECRET,
      sessionExists: !!session?.user?.email,
      baseUrl: process.env.NEON_AUTH_BASE_URL?.replace(/https:\/\/[^/]+/, 'https://***'),
    })
  } catch (error) {
    return Response.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      neonAuthConfigured: !!process.env.NEON_AUTH_BASE_URL,
    }, { status: 500 })
  }
}
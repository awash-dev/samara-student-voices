import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { parseApprovedCookie, parseRoleCookie } from '@/lib/auth/cookies'
import { auth } from '@/lib/auth/server'

const protectedPrefixes = [
  '/dashboard',
  '/executive',
  '/admin',
  '/superadmin',
  '/api/messages',
  '/api/replies',
  '/api/preferences',
  '/api/ably-token',
  '/api/executive',
  '/api/admin',
]

const authMiddleware = auth.middleware({
  loginUrl: '/auth/sign-in',
})

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // 0. Neon Auth OAuth verifier exchange:
  // When returning from an OAuth provider (e.g. Google), the URL includes `neon_auth_session_verifier`.
  // Neon Auth middleware must intercept this to exchange the verifier and challenge cookie for
  // the real session token, and redirect to the clean callback URL with Set-Cookie headers.
  if (searchParams.has('neon_auth_session_verifier')) {
    try {
      const authResponse = await authMiddleware(request)
      if (authResponse) {
        return authResponse
      }
    } catch (err) {
      console.error('Neon Auth OAuth verifier exchange error in middleware:', err)
    }
  }

  // 1. Skip static assets, favicon, and auth APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next()
  }

  // 2. Check if route is protected
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  )

  // 3. Guest & Public Pages:
  // Any visitor can freely see the home page (/), privacy policy (/privacy),
  // pending-approval (/pending-approval), and auth pages (/auth/*) WITHOUT registering
  if (!isProtected) {
    return NextResponse.next()
  }

  // 4. Protected Routes: Check user cookies
  const role = parseRoleCookie(request.cookies.get('user_role')?.value)
  const approved = parseApprovedCookie(
    request.cookies.get('user_approved')?.value
  )
  const sessionToken =
    request.cookies.get('better-auth.session_token')?.value ||
    request.cookies.get('__Secure-better-auth.session_token')?.value ||
    request.cookies.get('__Secure-neon-auth.session_token')?.value ||
    request.cookies.get('neon-auth.session_token')?.value ||
    request.cookies.get('auth_session')?.value ||
    request.cookies.getAll().find(c => c.name.includes('session_token'))?.value

  // If no session token, user is logged out: redirect to sign-in
  if (!sessionToken) {
    const signInUrl = new URL('/auth/sign-in', request.url)
    signInUrl.searchParams.set('redirect', pathname)
    const res = NextResponse.redirect(signInUrl)
    if (role) {
      res.cookies.delete('user_role')
      res.cookies.delete('user_approved')
    }
    return res
  }

  // If role cookie is present, enforce approval & role-based access
  if (role) {
    if (!approved) {
      return NextResponse.redirect(new URL('/pending-approval', request.url))
    }

    if (!pathname.startsWith('/api/')) {
      const isExecutivePath = pathname.startsWith('/executive')
      const isAdminPath = pathname.startsWith('/admin')
      const isSuperadminPath = pathname.startsWith('/superadmin')

      if (role === 'student' && (isExecutivePath || isAdminPath || isSuperadminPath)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      if (role === 'executive' && (isAdminPath || isSuperadminPath)) {
        return NextResponse.redirect(new URL('/executive', request.url))
      }
      if (role === 'admin' && isSuperadminPath) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }

    return NextResponse.next()
  }

  // Session token exists; let downstream page/route handler verify full DB session
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
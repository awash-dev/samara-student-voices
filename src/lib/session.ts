import { headers, cookies } from 'next/headers'
import { auth } from '@/lib/auth/server'
import type { AppRole } from '@/lib/auth/roles'
import { db, sql } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export type SessionUser = {
  id: string
  email: string
  name: string | null
  role: AppRole
  approved: boolean
}

// In-memory cache (60 seconds) to coalesce concurrent API calls and smooth over Neon cold starts
type CachedSession = {
  user: SessionUser | null
  expires: number
}
const sessionCache = new Map<string, CachedSession>()
const userEmailCache = new Map<string, { user: SessionUser; expires: number; staleExpires: number }>()

export function clearSessionCache(token?: string) {
  if (token) {
    sessionCache.delete(token)
  } else {
    sessionCache.clear()
  }
  userEmailCache.clear()
}

// Timeout wrapper for auth.getSession() with request headers forwarded (12s timeout for cloud auth)
async function getSessionWithTimeout(timeoutMs = 12000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const hdrs = await headers().catch(() => null)
    const result = await auth.getSession({
      fetchOptions: {
        signal: controller.signal,
        ...(hdrs ? { headers: hdrs } : {}),
      },
    })
    return result
  } catch {
    return { data: null, error: true }
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Fallback to resolve user from database directly when Neon Auth HTTP proxy is slow or cold
 */
async function getSessionFromDbDirectly(sessionCookie: string): Promise<{ email: string; name: string | null; authUserId: string } | null> {
  try {
    // Better Auth / Neon Auth sometimes signs or prefixes tokens with "s:" or url-encodes
    const rawToken = sessionCookie.split('.')[0].replace(/^s:/, '')

    const rows = await Promise.race([
      sql`
        SELECT u.id as "authUserId", u.email, u.name
        FROM neon_auth.session s
        JOIN neon_auth.user u ON u.id = s."userId"
        WHERE (s.token = ${rawToken} OR s.token = ${sessionCookie})
          AND s."expiresAt" > NOW()
        LIMIT 1;
      `,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Database session query timeout (20s)')), 20000)
      ),
    ])

    if (!rows || rows.length === 0) return null
    return {
      email: rows[0].email,
      name: rows[0].name,
      authUserId: rows[0].authUserId,
    }
  } catch (err) {
    console.warn('[Session] Direct DB session query notice:', err)
    return null
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies().catch(() => null)
    const allCookies = cookieStore ? cookieStore.getAll() : []
    const hasSessionCookie = allCookies.some(
      (c) =>
        c.name.includes('session') ||
        c.name.includes('auth') ||
        c.name.includes('token')
    )

    // Fast-path: If no auth or session cookie exists at all, user is definitely logged out!
    if (!hasSessionCookie) {
      return null
    }

    // Check token-based cache
    const sessionCookieObj = allCookies.find(
      (c) =>
        c.name.includes('session_token') ||
        c.name.includes('session-token') ||
        c.name === 'auth_session' ||
        c.name.includes('local.session_data') ||
        (c.name.includes('session') && c.value.length > 20)
    )
    const sessionToken = sessionCookieObj?.value || 'unknown_token'
    const cached = sessionCache.get(sessionToken)
    if (cached && cached.expires > Date.now()) {
      return cached.user
    }

    let email: string | null = null
    let name: string | null = null
    let authUserId: string | null = null

    // 1. Try Neon Auth server getSession
    const { data: session } = await getSessionWithTimeout()
    if (session?.user?.email) {
      email = session.user.email
      name = session.user.name || null
      authUserId = session.user.id || null
    } else if (sessionToken) {
      // 2. Direct database session fallback using retry-aware sql client
      const dbSession = await getSessionFromDbDirectly(sessionToken)
      if (dbSession?.email) {
        email = dbSession.email
        name = dbSession.name
        authUserId = dbSession.authUserId
      }
    }

    if (!email) {
      sessionCache.set(sessionToken, { user: null, expires: Date.now() + 5000 })
      return null
    }

    const normalizedEmail = email.toLowerCase()

    // 3. Fast-path: check email-level cache (survives token formatting changes)
    const cachedEmail = userEmailCache.get(normalizedEmail)
    if (cachedEmail && cachedEmail.expires > Date.now()) {
      sessionCache.set(sessionToken, { user: cachedEmail.user, expires: cachedEmail.expires })
      return cachedEmail.user
    }

    // 4. Query application user record with generous cold-start tolerance (25s)
    let user: typeof users.$inferSelect | undefined
    try {
      const [queriedUser] = await Promise.race([
        db
          .select()
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .limit(1),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Database user query timeout (25s)')), 25000)
        ),
      ])
      user = queriedUser
    } catch (queryErr) {
      // Graceful fallback to stale email cache (up to 5 min) if database cold-start timed out
      if (cachedEmail && cachedEmail.staleExpires > Date.now()) {
        console.warn(`[Session] DB timeout for ${normalizedEmail}, serving from warm cache`)
        return cachedEmail.user
      }
      throw queryErr
    }

    if (user) {
      // If authUserId not saved yet, save it asynchronously
      if (!user.authUserId && authUserId) {
        void db
          .update(users)
          .set({ authUserId })
          .where(eq(users.id, user.id))
          .catch(() => {})
      }

      const sessionUser: SessionUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as AppRole,
        approved: user.approved,
      }

      const expires = Date.now() + 60000 // 60s fresh
      const staleExpires = Date.now() + 300000 // 5m stale fallback
      sessionCache.set(sessionToken, { user: sessionUser, expires })
      userEmailCache.set(normalizedEmail, { user: sessionUser, expires, staleExpires })
      return sessionUser
    }

    // If user is authenticated in Neon Auth (e.g. Google OAuth) but not yet in public.users,
    // auto-provision them with 'student' role (pending approval)
    const [newUser] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        name: name || null,
        role: 'student',
        approved: false,
        authUserId: authUserId ?? null,
      })
      .returning()

    const provisionedUser: SessionUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as AppRole,
      approved: newUser.approved,
    }

    const expires = Date.now() + 60000
    const staleExpires = Date.now() + 300000
    sessionCache.set(sessionToken, { user: provisionedUser, expires })
    userEmailCache.set(normalizedEmail, { user: provisionedUser, expires, staleExpires })
    return provisionedUser
  } catch (err) {
    console.error('getSessionUser error:', err)
    return null
  }
}

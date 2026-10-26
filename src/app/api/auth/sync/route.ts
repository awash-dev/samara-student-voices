import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSessionUser } from '@/lib/session'
import { notifyRegistrationReceived } from '@/lib/email/notify'

// Called after sign-up / OAuth callback to sync user into our users table
export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const role = body.role || sessionUser.role || 'student'

    if (!['student', 'executive'].includes(role)) {
      return Response.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if user already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, sessionUser.email.toLowerCase()))
      .limit(1)

    if (existing) {
      const updates: Partial<typeof users.$inferInsert> = {}

      // If user is unapproved, allow updating their role
      if (!existing.approved && existing.role !== role) {
        updates.role = role
      }

      if (Object.keys(updates).length > 0) {
        const [updated] = await db
          .update(users)
          .set(updates)
          .where(eq(users.id, existing.id))
          .returning()
        return Response.json(updated ?? existing)
      }

      return Response.json(existing)
    }

    // Create new user (approved=false by default)
    const [newUser] = await db
      .insert(users)
      .values({
        email: sessionUser.email.toLowerCase(),
        name: sessionUser.name || null,
        role,
        approved: false,
      })
      .returning()

    void notifyRegistrationReceived({
      email: newUser.email,
      name: newUser.name,
      role: role as 'student' | 'executive',
    }).catch(console.error)

    return Response.json(newUser, { status: 201 })
  } catch (error) {
    console.error('POST /api/auth/sync error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET: returns current user's DB record
export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return Response.json(user)
  } catch (error) {
    console.error('GET /api/auth/sync error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

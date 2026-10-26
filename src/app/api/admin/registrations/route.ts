import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { isAdminRole } from '@/lib/auth/roles'
import { getSessionUser } from '@/lib/session'

export async function GET() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isAdminRole(sessionUser.role)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const pendingUsers = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        approved: users.approved,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.approved, false))
      .orderBy(users.createdAt)

    return Response.json(pendingUsers)
  } catch (error) {
    console.error('GET /api/admin/registrations error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

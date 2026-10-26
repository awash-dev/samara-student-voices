import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notifyAccountApproved } from '@/lib/email/notify'
import { requireRole } from '@/lib/api/guards'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await requireRole(['admin', 'superadmin'])
  if (sessionUser instanceof Response) return sessionUser

  const { id } = await params

  try {
    const [updated] = await db
      .update(users)
      .set({ approved: true })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        approved: users.approved,
      })

    if (!updated) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    void notifyAccountApproved({
      email: updated.email,
      name: updated.name,
      role: updated.role,
    }).catch(console.error)

    return Response.json(updated)
  } catch (error) {
    console.error('PATCH /api/admin/approve/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

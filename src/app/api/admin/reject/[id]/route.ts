import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { isAdminRole } from '@/lib/auth/roles'
import { requireRole } from '@/lib/api/guards'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await requireRole(['admin', 'superadmin'])
  if (sessionUser instanceof Response) return sessionUser

  const { id } = await params

  try {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id, email: users.email })

    if (!deleted) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json({ success: true, deleted })
  } catch (error) {
    console.error('DELETE /api/admin/reject/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const PATCH = DELETE


import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { messages } from '@/lib/db/schema'
import { and, eq, ne } from 'drizzle-orm'
import {
  canViewAllMessages,
  canViewSensitiveReports,
  isReportRestrictedToSuperadmin,
} from '@/lib/auth/roles'
import { getSessionUser } from '@/lib/session'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!canViewAllMessages(sessionUser.role)) {
    return Response.json({ error: 'Only executives can update message status' }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { status, internalNote } = body

    if (!status || !['pending', 'in_review', 'resolved'].includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { status }
    if (internalNote !== undefined) {
      updateData.internalNote = internalNote
    }

    // Apply the authorization rule in the update itself so the common case
    // needs only one database round trip.
    const canSeeSensitive = canViewSensitiveReports(sessionUser.role)
    const [updated] = await db
      .update(messages)
      .set(updateData)
      .where(
        canSeeSensitive
          ? eq(messages.id, id)
          : and(
              eq(messages.id, id),
              ne(messages.type, 'harassment'),
              eq(messages.anonymous, false)
            )
      )
      .returning()

    if (updated) {
      return Response.json(updated)
    }

    // No row was updated. Determine whether it is missing or restricted.
    const [message] = await db
      .select({ type: messages.type, anonymous: messages.anonymous })
      .from(messages)
      .where(eq(messages.id, id))
      .limit(1)

    if (!message) {
      return Response.json({ error: 'Message not found' }, { status: 404 })
    }

    if (
      isReportRestrictedToSuperadmin(message) &&
      !canSeeSensitive
    ) {
      return Response.json(
        { error: 'Harassment and anonymous reports are restricted to Super Admin' },
        { status: 403 }
      )
    }

    return Response.json({ error: 'Message not found' }, { status: 404 })
  } catch (error) {
    console.error('PATCH /api/messages/[id]/status error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

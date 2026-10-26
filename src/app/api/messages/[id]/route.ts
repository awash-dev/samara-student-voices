import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { messages, replies, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import {
  canViewAllMessages,
  canViewSensitiveReports,
  isAdminRole,
  isReportRestrictedToSuperadmin,
} from '@/lib/auth/roles'
import { getSessionUser } from '@/lib/session'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id))
      .limit(1)

    if (!message) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    // Students can only see their own messages
    if (sessionUser.role === 'student' && message.fromUserId !== sessionUser.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (isAdminRole(sessionUser.role) && !canViewAllMessages(sessionUser.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Harassment and anonymous reports are hidden from executives.
    if (
      canViewAllMessages(sessionUser.role) &&
      !canViewSensitiveReports(sessionUser.role) &&
      isReportRestrictedToSuperadmin(message)
    ) {
      return Response.json(
        { error: 'Harassment and anonymous reports are restricted to Super Admin' },
        { status: 403 }
      )
    }

    if (canViewAllMessages(sessionUser.role)) {
      const msgReplies = await db
        .select({
          id: replies.id,
          messageId: replies.messageId,
          fromUserId: replies.fromUserId,
          content: replies.content,
          createdAt: replies.createdAt,
          senderEmail: users.email,
        })
        .from(replies)
        .leftJoin(users, eq(replies.fromUserId, users.id))
        .where(eq(replies.messageId, id))
        .orderBy(replies.createdAt)

      const [sender] = message.fromUserId
        ? await db
            .select({ email: users.email })
            .from(users)
            .where(eq(users.id, message.fromUserId))
            .limit(1)
        : []

      // Harassment identity is visible to Super Admin for safety review.
      // Anonymous feedback stays masked for everyone.
      const shouldMaskSender =
        message.anonymous && message.type !== 'harassment'

      return Response.json({
        ...message,
        fromUserId: shouldMaskSender ? null : message.fromUserId,
        senderEmail: shouldMaskSender ? null : sender?.email ?? null,
        replies: msgReplies,
      })
    }

    const msgReplies = await db
      .select({
        id: replies.id,
        messageId: replies.messageId,
        fromUserId: replies.fromUserId,
        content: replies.content,
        createdAt: replies.createdAt,
        senderEmail: users.email,
      })
      .from(replies)
      .leftJoin(users, eq(replies.fromUserId, users.id))
      .where(eq(replies.messageId, id))
      .orderBy(replies.createdAt)

    return Response.json({ ...message, replies: msgReplies })
  } catch (error) {
    console.error('GET /api/messages/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

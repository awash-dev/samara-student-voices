import { NextRequest, after } from 'next/server'
import { db } from '@/lib/db'
import { messages, replies, users } from '@/lib/db/schema'
import { eq, and, desc, ne } from 'drizzle-orm'
import {
  canViewAllMessages,
  canViewSensitiveReports,
  isReportRestrictedToSuperadmin,
} from '@/lib/auth/roles'
import { requireSession } from '@/lib/api/guards'
import { publishToChannel } from '@/lib/ably'
import { notifyNewMessage } from '@/lib/email/notify'

export async function GET(request: NextRequest) {
  const sessionUser = await requireSession()
  if (sessionUser instanceof Response) return sessionUser

  const { searchParams } = request.nextUrl
  const typeFilter = searchParams.get('type') as 'harassment' | 'feedback' | null
  const statusFilter = searchParams.get('status') as 'pending' | 'in_review' | 'resolved' | null

  try {
    if (sessionUser.role === 'student') {
      // Students only see their own messages
      const conditions = [eq(messages.fromUserId, sessionUser.id)]
      if (typeFilter) conditions.push(eq(messages.type, typeFilter))
      if (statusFilter) conditions.push(eq(messages.status, statusFilter))

      const studentMessages = await db
        .select()
        .from(messages)
        .where(and(...conditions))
        .orderBy(desc(messages.createdAt))

      // Fetch replies for each message
      const messagesWithReplies = await Promise.all(
        studentMessages.map(async (msg) => {
          const msgReplies = await db
            .select()
            .from(replies)
            .where(eq(replies.messageId, msg.id))
            .orderBy(replies.createdAt)
          return { ...msg, replies: msgReplies }
        })
      )

      return Response.json(messagesWithReplies)
    }

    if (canViewAllMessages(sessionUser.role)) {
      // Super Admin sees every report. Executives only see identified feedback.
      const conditions = []
      if (!canViewSensitiveReports(sessionUser.role)) {
        conditions.push(ne(messages.type, 'harassment'))
        conditions.push(eq(messages.anonymous, false))
      }
      if (typeFilter) conditions.push(eq(messages.type, typeFilter))
      if (statusFilter) conditions.push(eq(messages.status, statusFilter))

      const allMessages = await db
        .select({
          id: messages.id,
          fromUserId: messages.fromUserId,
          type: messages.type,
          content: messages.content,
          anonymous: messages.anonymous,
          status: messages.status,
          internalNote: messages.internalNote,
          createdAt: messages.createdAt,
          senderEmail: users.email,
          senderName: users.name,
        })
        .from(messages)
        .leftJoin(users, eq(messages.fromUserId, users.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(messages.createdAt))

      const messagesWithReplies = await Promise.all(
        allMessages.map(async (msg) => {
          const msgReplies = await db
            .select({
              id: replies.id,
              messageId: replies.messageId,
              fromUserId: replies.fromUserId,
              content: replies.content,
              createdAt: replies.createdAt,
              senderEmail: users.email,
              senderName: users.name,
            })
            .from(replies)
            .leftJoin(users, eq(replies.fromUserId, users.id))
            .where(eq(replies.messageId, msg.id))
            .orderBy(replies.createdAt)
          // Harassment identity is visible to Super Admin for safety review.
          // Anonymous feedback stays masked, and executives never receive harassment.
          const revealIdentity =
            canViewSensitiveReports(sessionUser.role) && msg.type === 'harassment'
          const shouldMask = msg.anonymous && !revealIdentity

          return {
            ...msg,
            senderEmail: shouldMask ? null : msg.senderEmail,
            senderName: shouldMask ? null : msg.senderName,
            fromUserId: shouldMask ? null : msg.fromUserId,
            replies: msgReplies,
          }
        })
      )

      return Response.json(messagesWithReplies)
    }

    return Response.json({ error: 'Forbidden' }, { status: 403 })
  } catch (error) {
    console.error('GET /api/messages error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const sessionUser = await requireSession()
  if (sessionUser instanceof Response) return sessionUser

  if (sessionUser.role !== 'student') {
    return Response.json({ error: 'Only students can submit messages' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { type, content, anonymous } = body

    if (!type || !content) {
      return Response.json({ error: 'type and content are required' }, { status: 400 })
    }

    if (!['harassment', 'feedback'].includes(type)) {
      return Response.json({ error: 'Invalid message type' }, { status: 400 })
    }

    const [newMessage] = await db
      .insert(messages)
      .values({
        fromUserId: sessionUser.id,
        type,
        content,
        anonymous: Boolean(anonymous),
        status: 'pending',
      })
      .returning()

    // Sensitive reports stay out of the executive notification channel.
    const notificationChannel = isReportRestrictedToSuperadmin(newMessage)
      ? 'superadmin:inbox'
      : 'executive:inbox'

    after(async () => {
      await Promise.allSettled([
        publishToChannel(notificationChannel, 'new-message', {
          messageId: newMessage.id,
          type: newMessage.type,
          anonymous: newMessage.anonymous,
          createdAt: newMessage.createdAt,
        }),
        notifyNewMessage(newMessage.id),
      ])
    })

    return Response.json({ message_id: newMessage.id, status: newMessage.status }, { status: 201 })
  } catch (error) {
    console.error('POST /api/messages error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, after } from 'next/server'
import { db } from '@/lib/db'
import { messages, replies, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import {
  canViewAllMessages,
  canViewSensitiveReports,
  isReportRestrictedToSuperadmin,
} from '@/lib/auth/roles'
import { requireSession } from '@/lib/api/guards'
import { publishToChannel } from '@/lib/ably'
import { notifyReplyReceived } from '@/lib/email/notify'

export async function POST(request: NextRequest) {
  const sessionUser = await requireSession()
  if (sessionUser instanceof Response) return sessionUser

  if (!canViewAllMessages(sessionUser.role)) {
    return Response.json({ error: 'Only executives can reply' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const message_id = body.message_id || body.messageId
    const content = body.content

    if (!message_id || !content) {
      return Response.json({ error: 'message_id and content are required' }, { status: 400 })
    }

    const [message] = await db
      .select({
        id: messages.id,
        type: messages.type,
        anonymous: messages.anonymous,
        fromUserId: messages.fromUserId,
        studentEmail: users.email,
      })
      .from(messages)
      .leftJoin(users, eq(messages.fromUserId, users.id))
      .where(eq(messages.id, message_id))
      .limit(1)

    if (!message) {
      return Response.json({ error: 'Message not found' }, { status: 404 })
    }

    if (
      isReportRestrictedToSuperadmin(message) &&
      !canViewSensitiveReports(sessionUser.role)
    ) {
      return Response.json(
        { error: 'Harassment and anonymous reports are restricted to Super Admin' },
        { status: 403 }
      )
    }

    // Insert the reply and flip the message to "in review" in one database
    // round trip. Notification work runs after the response has been sent.
    const [insertedReplies] = await db.batch([
      db
        .insert(replies)
        .values({
          messageId: message_id,
          fromUserId: sessionUser.id,
          content,
        })
        .returning(),
      db
        .update(messages)
        .set({ status: 'in_review' })
        .where(eq(messages.id, message_id)),
    ])

    const newReply = insertedReplies[0]
    if (!newReply) {
      throw new Error('Reply insert returned no row')
    }

    after(async () => {
      await Promise.allSettled([
        publishToChannel(`message:${message_id}`, 'new-reply', {
          id: newReply.id,
          replyId: newReply.id,
          content: newReply.content,
          createdAt: newReply.createdAt,
          fromExecutive: true,
          senderEmail: sessionUser.email,
        }),
        !message.anonymous && message.studentEmail
          ? notifyReplyReceived({
              email: message.studentEmail,
              messageId: message_id,
            })
          : Promise.resolve(),
      ])
    })

    return Response.json(
      {
        id: newReply.id,
        reply_id: newReply.id,
        messageId: message_id,
        content: newReply.content,
        createdAt: newReply.createdAt,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/replies error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

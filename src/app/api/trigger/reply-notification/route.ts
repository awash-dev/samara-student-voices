import { NextRequest } from 'next/server'
import { notifyReplyReceived } from '@/lib/email/notify'

export async function POST(request: NextRequest) {
  try {
    const { studentEmail, messageId } = await request.json()

    if (!studentEmail) {
      return Response.json({ error: 'No student email provided' }, { status: 400 })
    }

    if (!messageId) {
      return Response.json({ error: 'No messageId provided' }, { status: 400 })
    }

    const result = await notifyReplyReceived({
      email: studentEmail,
      messageId,
    })

    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 502 })
    }

    return Response.json({ sent: true })
  } catch (error) {
    console.error('Trigger reply-notification email error:', error)
    return Response.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

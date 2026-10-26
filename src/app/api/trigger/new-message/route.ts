import { NextRequest } from 'next/server'
import { notifyNewMessage } from '@/lib/email/notify'

export async function POST(request: NextRequest) {
  try {
    const { messageId } = await request.json()

    if (!messageId) {
      return Response.json({ error: 'messageId is required' }, { status: 400 })
    }

    const result = await notifyNewMessage(messageId)

    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 404 })
    }

    return Response.json({ sent: result.sent, failed: result.failed })
  } catch (error) {
    console.error('Trigger new-message email error:', error)
    return Response.json({ error: 'Failed to send emails' }, { status: 500 })
  }
}

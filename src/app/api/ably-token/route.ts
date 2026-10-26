import { getAblyRest } from '@/lib/ably'
import { getSessionUser } from '@/lib/session'

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ably = getAblyRest()
    if (!ably) {
      return Response.json({ error: 'Real-time features not configured' }, { status: 503 })
    }

    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: user.id,
    })

    return Response.json(tokenRequest)
  } catch (error) {
    console.error('Ably token error:', error)
    return Response.json({ error: 'Failed to create token' }, { status: 500 })
  }
}

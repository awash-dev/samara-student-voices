import Ably from 'ably'

// Server-side Ably client (REST)
let ablyRest: Ably.Rest | null = null

export function getAblyRest(): Ably.Rest | null {
  if (!process.env.ABLY_API_KEY) {
    console.warn('ABLY_API_KEY not configured - real-time features disabled')
    return null
  }
  
  if (!ablyRest) {
    try {
      ablyRest = new Ably.Rest({ key: process.env.ABLY_API_KEY })
    } catch (error) {
      console.error('Failed to initialize Ably:', error)
      return null
    }
  }
  return ablyRest
}

export async function publishToChannel(channel: string, event: string, data: unknown) {
  try {
    const client = getAblyRest()
    if (!client) {
      console.warn('Ably not configured - skipping publish')
      return
    }
    
    const ch = client.channels.get(channel)
    await ch.publish(event, data)
  } catch (error) {
    console.error('Failed to publish to Ably channel:', error)
    // Don't throw - allow the request to continue
  }
}

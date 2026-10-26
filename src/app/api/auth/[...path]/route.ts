import { auth } from '@/lib/auth/server'

// Destructure individual HTTP method exports — required by Next.js 16 route handlers
export const { GET, POST } = auth.handler()

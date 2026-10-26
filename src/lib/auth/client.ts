'use client'

import { createAuthClient } from '@neondatabase/auth/next'

// createAuthClient() reads NEXT_PUBLIC_NEON_AUTH_BASE_URL automatically from env
export const authClient = createAuthClient()

import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { AUTH_COOKIE_OPTIONS } from "@/lib/auth/cookies"
import { auth } from "@/lib/auth/server"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { getSessionUser } from "@/lib/session"

// Timeout wrapper for auth.getSession()
async function getSessionWithTimeout(timeoutMs = 5000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    // @ts-ignore - fetchOptions not typed but supported by Neon Auth
    const result = await auth.getSession({ fetchOptions: { signal: controller.signal } })
    return result
  } finally {
    clearTimeout(timeout)
  }
}

/** Returns DB user and refreshes role cookies for middleware routing */
export async function GET() {
  let user = await getSessionUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: session } = await getSessionWithTimeout()
  if (session?.user?.id) {
    const [row] = await db
      .select({ authUserId: users.authUserId })
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1)
    if (row && !row.authUserId) {
      await db
        .update(users)
        .set({ authUserId: session.user.id })
        .where(eq(users.email, user.email))
    }
  }

  const res = NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    approved: user.approved,
  })

  res.cookies.set("user_role", user.role, AUTH_COOKIE_OPTIONS)
  res.cookies.set("user_approved", user.approved ? "1" : "0", AUTH_COOKIE_OPTIONS)

  return res
}

import { eq } from "drizzle-orm"

import { requireAdminRole } from "@/lib/api/guards"
import {
  findAuthUserIdByEmail,
  setAuthUserPassword,
} from "@/lib/auth/neon-user"
import { sendPasswordResetEmail } from "@/lib/auth/password-reset"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

async function getTargetUser(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return user ?? null
}

async function resolveAuthId(user: {
  authUserId: string | null
  email: string
}) {
  if (user.authUserId) return user.authUserId
  return findAuthUserIdByEmail(user.email)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminRole()
  if (session instanceof Response) return session

  const { id } = await params
  const body = await request.json()
  const action = body.action as "reset" | "set"

  const target = await getTargetUser(id)
  if (!target) {
    return Response.json({ error: "User not found" }, { status: 404 })
  }

  const privilegedTarget =
    target.role === "admin" || target.role === "superadmin"

  if (
    privilegedTarget &&
    target.id !== session.id &&
    session.role !== "superadmin"
  ) {
    return Response.json(
      { error: "Cannot change password for other administrators" },
      { status: 403 }
    )
  }

  try {
    if (action === "reset") {
      const result = await sendPasswordResetEmail(target.email, target.name)
      if (!result.ok) {
        return Response.json({ error: result.error }, { status: 502 })
      }
      return Response.json({
        success: true,
        message: "Password reset email sent",
        ...(process.env.NODE_ENV !== "production" && result.resetUrl
          ? { debugResetUrl: result.resetUrl }
          : {}),
      })
    }

    if (action === "set") {
      const newPassword = (body.newPassword as string | undefined)?.trim()
      if (!newPassword || newPassword.length < 8) {
        return Response.json(
          { error: "Password must be at least 8 characters" },
          { status: 400 }
        )
      }

      const authUserId = await resolveAuthId(target)
      if (!authUserId) {
        return Response.json(
          {
            error:
              "No auth account linked for this user. Ask them to sign in once, or use reset email.",
          },
          { status: 404 }
        )
      }

      if (!target.authUserId) {
        await db
          .update(users)
          .set({ authUserId })
          .where(eq(users.id, target.id))
      }

      const result = await setAuthUserPassword(authUserId, newPassword, target.email)
      if (!result.ok) {
        return Response.json({ error: result.error }, { status: 502 })
      }

      return Response.json({ success: true, message: "Password updated" })
    }

    return Response.json(
      { error: 'action must be "reset" or "set"' },
      { status: 400 }
    )
  } catch (error) {
    console.error("POST /api/admin/users/[id]/password error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

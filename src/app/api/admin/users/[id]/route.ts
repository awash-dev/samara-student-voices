import { eq } from "drizzle-orm"

import { requireAdminRole } from "@/lib/api/guards"
import {
  findAuthUserIdByEmail,
  removeAuthUser,
} from "@/lib/auth/neon-user"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminRole()
  if (session instanceof Response) return session

  const { id } = await params

  if (id === session.id) {
    return Response.json(
      { error: "You cannot edit your own account here" },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()
    const updates: Partial<{
      name: string | null
      email: string
      role: "student" | "executive" | "admin"
      approved: boolean
    }> = {}

    if (typeof body.name === "string") updates.name = body.name.trim() || null
    if (typeof body.email === "string") updates.email = body.email.trim().toLowerCase()
    if (body.role === "student" || body.role === "executive") {
      updates.role = body.role
    } else if (body.role === "admin" && session.role === "superadmin") {
      updates.role = "admin"
    }
    if (typeof body.approved === "boolean") updates.approved = body.approved

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning()

    if (!updated) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    return Response.json(updated)
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminRole()
  if (session instanceof Response) return session

  const { id } = await params

  if (id === session.id) {
    return Response.json(
      { error: "You cannot delete your own account" },
      { status: 400 }
    )
  }

  try {
    const [target] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (!target) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    if (target.role === "superadmin") {
      return Response.json(
        { error: "Cannot delete super administrator accounts" },
        { status: 403 }
      )
    }

    if (target.role === "admin" && session.role !== "superadmin") {
      return Response.json(
        { error: "Cannot delete administrator accounts" },
        { status: 403 }
      )
    }

    let authUserId = target.authUserId
    if (!authUserId) {
      authUserId = await findAuthUserIdByEmail(target.email)
    }

    if (authUserId) {
      const removed = await removeAuthUser(authUserId)
      if (!removed.ok) {
        console.warn("Auth user removal:", removed.error)
      }
    }

    await db.delete(users).where(eq(users.id, id))

    return Response.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

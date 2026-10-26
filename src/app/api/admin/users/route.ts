import { eq, inArray } from "drizzle-orm"

import { requireAdminRole } from "@/lib/api/guards"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

export async function GET(request: Request) {
  const session = await requireAdminRole()
  if (session instanceof Response) return session

  const { searchParams } = new URL(request.url)
  const roleFilter = searchParams.get("role")
  const superadminView = session.role === "superadmin"

  try {
    const roleCondition =
      roleFilter === "student"
        ? eq(users.role, "student")
        : roleFilter === "executive"
          ? eq(users.role, "executive")
          : roleFilter === "admin" && superadminView
            ? eq(users.role, "admin")
            : superadminView
              ? undefined
              : inArray(users.role, ["student", "executive"])

    const baseQuery = db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        approved: users.approved,
        createdAt: users.createdAt,
        authUserId: users.authUserId,
      })
      .from(users)

    const list = roleCondition
      ? await baseQuery.where(roleCondition).orderBy(users.createdAt)
      : await baseQuery.orderBy(users.createdAt)

    return Response.json(list)
  } catch (error) {
    console.error("GET /api/admin/users error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

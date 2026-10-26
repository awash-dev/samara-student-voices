import { and, eq } from "drizzle-orm"

import { requireRole } from "@/lib/api/guards"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

export async function GET() {
  const session = await requireRole(["executive"])
  if (session instanceof Response) return session

  try {
    const students = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        approved: users.approved,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(eq(users.role, "student"), eq(users.approved, true)))
      .orderBy(users.createdAt)

    return Response.json(students)
  } catch (error) {
    console.error("GET /api/executive/students error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

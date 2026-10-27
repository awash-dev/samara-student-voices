import { eq, inArray } from "drizzle-orm"
import crypto from "node:crypto"
import { neon } from "@neondatabase/serverless"

import { requireAdminRole } from "@/lib/api/guards"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { hashPassword } from "@/lib/auth/password"

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

export async function POST(request: Request) {
  const session = await requireAdminRole()
  if (session instanceof Response) return session

  try {
    const body = await request.json()
    const email = (body.email as string | undefined)?.trim().toLowerCase()
    const name = (body.name as string | undefined)?.trim() || null
    const role = body.role as "student" | "executive" | "admin" | "superadmin"
    const password = (body.password as string | undefined)?.trim()
    const approved = typeof body.approved === "boolean" ? body.approved : true

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Valid email address is required" }, { status: 400 })
    }

    if (!role || !["student", "executive", "admin", "superadmin"].includes(role)) {
      return Response.json({ error: "Invalid role selected" }, { status: 400 })
    }

    if ((role === "admin" || role === "superadmin") && session.role !== "superadmin") {
      return Response.json(
        { error: "Only Super Administrators can create administrative accounts" },
        { status: 403 }
      )
    }

    if (!password || password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    // Check if user already exists in public.users
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existing) {
      return Response.json(
        { error: "A user with this email address already exists" },
        { status: 400 }
      )
    }

    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      return Response.json({ error: "Database not configured" }, { status: 500 })
    }

    const sql = neon(dbUrl)
    const now = new Date()

    // 1. Check or create user in neon_auth.user
    const authUsers = await sql`
      SELECT id FROM neon_auth.user WHERE LOWER(email) = ${email} LIMIT 1;
    `
    let authUserId: string

    if (authUsers.length > 0) {
      authUserId = authUsers[0].id
    } else {
      authUserId = crypto.randomUUID()
      await sql`
        INSERT INTO neon_auth.user (
          id, email, name, "emailVerified", "createdAt", "updatedAt"
        ) VALUES (
          ${authUserId}, ${email}, ${name || ''}, true, ${now}, ${now}
        );
      `
    }

    // 2. Set hashed password in neon_auth.account
    const hashedPassword = await hashPassword(password)
    const existingAccounts = await sql`
      SELECT id FROM neon_auth.account
      WHERE "userId" = ${authUserId} AND "providerId" = 'credential'
      LIMIT 1;
    `

    if (existingAccounts.length > 0) {
      await sql`
        UPDATE neon_auth.account
        SET password = ${hashedPassword}, "updatedAt" = ${now}
        WHERE id = ${existingAccounts[0].id};
      `
    } else {
      const newAccId = crypto.randomUUID()
      await sql`
        INSERT INTO neon_auth.account (
          id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt"
        ) VALUES (
          ${newAccId}, ${authUserId}, ${authUserId}, 'credential', ${hashedPassword}, ${now}, ${now}
        );
      `
    }

    // 3. Create user in public.users
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        role,
        approved,
        authUserId,
      })
      .returning()

    return Response.json({ success: true, user: newUser }, { status: 201 })
  } catch (error) {
    console.error("POST /api/admin/users error:", error)
    return Response.json({ error: "Failed to register user" }, { status: 500 })
  }
}

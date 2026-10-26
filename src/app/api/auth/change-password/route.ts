import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { setUserAccountPassword, verifyPassword } from "@/lib/auth/password"
import { neon } from "@neondatabase/serverless"

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const currentPassword = (body.currentPassword as string | undefined)?.trim()
    const newPassword = (body.newPassword as string | undefined)?.trim()

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const sql = neon(dbUrl)

    // Lookup auth user and credential account
    const authUsers = await sql`
      SELECT id, email FROM neon_auth.user WHERE LOWER(email) = ${user.email.toLowerCase()} LIMIT 1;
    `
    const authUserId = authUsers[0]?.id || user.id

    const accounts = await sql`
      SELECT id, password FROM neon_auth.account
      WHERE "userId" = ${authUserId} AND "providerId" = 'credential'
      LIMIT 1;
    `

    // If an existing password exists, verify current password
    if (accounts.length > 0 && accounts[0].password) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required" },
          { status: 400 }
        )
      }

      const isCurrentValid = await verifyPassword(currentPassword, accounts[0].password)
      if (!isCurrentValid) {
        return NextResponse.json(
          { error: "Incorrect current password" },
          { status: 400 }
        )
      }
    }

    // Set new password
    const result = await setUserAccountPassword(authUserId, user.email, newPassword)
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "Failed to update password" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("POST /api/auth/change-password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

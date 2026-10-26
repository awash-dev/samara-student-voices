import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { setUserAccountPassword } from "@/lib/auth/password"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const token = (body.token as string | undefined)?.trim()
    const newPassword = (body.newPassword as string | undefined)?.trim()
    const emailHint = (body.email as string | undefined)?.trim().toLowerCase()

    if (!token) {
      return NextResponse.json({ error: "Reset token is required" }, { status: 400 })
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const sql = neon(dbUrl)

    // Lookup token in verification table
    const records = await sql`
      SELECT id, identifier, value, "expiresAt"
      FROM neon_auth.verification
      WHERE value = ${token}
      LIMIT 1;
    `

    if (records.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired password reset link" },
        { status: 400 }
      )
    }

    const record = records[0]
    const expiresAt = new Date(record.expiresAt)
    if (expiresAt < new Date()) {
      await sql`DELETE FROM neon_auth.verification WHERE id = ${record.id};`
      return NextResponse.json(
        { error: "This password reset link has expired. Please request a new one." },
        { status: 400 }
      )
    }

    const email = record.identifier || emailHint
    if (!email) {
      return NextResponse.json({ error: "Cannot identify account for this token" }, { status: 400 })
    }

    // Find auth user
    let authUsers = await sql`
      SELECT id, email, name FROM neon_auth.user WHERE LOWER(email) = ${email.toLowerCase()} LIMIT 1;
    `

    let authUserId: string | null = authUsers[0]?.id || null

    if (!authUserId) {
      // Check public.users
      const pubUsers = await sql`
        SELECT id, email, name, auth_user_id FROM public.users WHERE LOWER(email) = ${email.toLowerCase()} LIMIT 1;
      `
      if (pubUsers.length > 0 && pubUsers[0].auth_user_id) {
        authUserId = pubUsers[0].auth_user_id
      } else if (pubUsers.length > 0) {
        // Create user in neon_auth.user
        const newAuthId = crypto.randomUUID()
        const now = new Date()
        await sql`
          INSERT INTO neon_auth.user (
            id, email, name, "emailVerified", "createdAt", "updatedAt"
          ) VALUES (
            ${newAuthId}, ${pubUsers[0].email}, ${pubUsers[0].name || ''}, false, ${now}, ${now}
          );
        `
        await sql`
          UPDATE public.users SET auth_user_id = ${newAuthId} WHERE id = ${pubUsers[0].id};
        `
        authUserId = newAuthId
      }
    }

    if (!authUserId) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 })
    }

    // Update password in neon_auth.account
    const result = await setUserAccountPassword(authUserId, email, newPassword)
    if (!result.ok) {
      return NextResponse.json({ error: result.error || "Failed to update password" }, { status: 500 })
    }

    // Delete used verification token
    await sql`DELETE FROM neon_auth.verification WHERE id = ${record.id};`

    return NextResponse.json({
      ok: true,
      message: "Password successfully updated! You can now sign in with your new password.",
    })
  } catch (error) {
    console.error("POST /api/auth/reset-password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

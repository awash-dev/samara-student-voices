import crypto from "node:crypto"
import { neon } from "@neondatabase/serverless"

import { sendEmail } from "@/lib/email"
import { getAppUrl, passwordResetEmail } from "@/lib/email/templates"

type PasswordResetResult =
  | { ok: true; skipped?: boolean; resetUrl?: string }
  | { ok: false; error: string }

/**
 * Send the password reset link through the platform SMTP account instead of
 * Neon Auth's shared default sender. The token is stored in Neon Auth's
 * verification table so the existing reset-password endpoint can consume it.
 */
export async function sendPasswordResetEmail(
  email: string,
  name?: string | null
): Promise<PasswordResetResult> {
  const normalized = email.trim().toLowerCase()
  if (!normalized) {
    return { ok: false, error: "Email is required" }
  }

  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    return { ok: false, error: "Database not configured" }
  }

  const sql = neon(dbUrl)
  const [authUsers, publicUsers] = await Promise.all([
    sql`SELECT id, email, name FROM neon_auth.user WHERE LOWER(email) = ${normalized} LIMIT 1;`,
    sql`SELECT id, email, name FROM public.users WHERE LOWER(email) = ${normalized} LIMIT 1;`,
  ])

  if (authUsers.length === 0 && publicUsers.length === 0) {
    return { ok: true, skipped: true }
  }

  const recipientName =
    name || authUsers[0]?.name || publicUsers[0]?.name || null
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
  const now = new Date()

  await sql`
    DELETE FROM neon_auth.verification
    WHERE identifier = ${normalized} AND "expiresAt" < NOW();
  `

  await sql`
    INSERT INTO neon_auth.verification (
      id, identifier, value, "expiresAt", "createdAt", "updatedAt"
    ) VALUES (
      ${crypto.randomUUID()}, ${normalized}, ${token}, ${expiresAt}, ${now}, ${now}
    );
  `

  const resetUrl = `${getAppUrl()}/auth/reset-password?token=${token}&email=${encodeURIComponent(normalized)}`
  const { subject, html } = passwordResetEmail({
    name: recipientName,
    resetUrl,
  })

  const result = await sendEmail(normalized, subject, html, {
    recipientName,
  })

  if (!result.ok) {
    return { ok: false, error: result.error }
  }

  return { ok: true, resetUrl }
}

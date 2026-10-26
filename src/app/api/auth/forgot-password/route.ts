import { NextResponse } from "next/server"

import { sendPasswordResetEmail } from "@/lib/auth/password-reset"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = (body.email as string | undefined)?.trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const result = await sendPasswordResetEmail(email)

    if (!result.ok) {
      console.warn("Reset email SMTP warning:", result.error)
    }

    return NextResponse.json({
      ok: true,
      message: "If an account exists with this email, a reset link has been sent.",
      // Include a fallback link in development so local testing is immediate.
      ...(process.env.NODE_ENV !== "production" && result.ok && result.resetUrl
        ? { debugResetUrl: result.resetUrl }
        : {}),
    })
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

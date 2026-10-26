import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { clearSessionCache } from "@/lib/session"

const COOKIES_TO_CLEAR = [
  "__Secure-neon-auth.session_token",
  "neon-auth.session_token",
  "__Secure-neon-auth.local.session_data",
  "__Secure-neon-auth.session_challange",
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
  "auth_session",
  "neon_auth_session",
  "neon_auth_session_verifier",
  "better-auth.csrf_token",
  "user_role",
  "user_approved",
]

async function clearSession(req: NextRequest) {
  // Clear in-memory session cache immediately
  clearSessionCache()

  // Extract session token to delete from database
  const allCookies = req.cookies.getAll()
  const sessionToken = allCookies.find(c => 
    c.name.includes("session_token") || 
    c.name.includes("session-token") || 
    c.name === "auth_session" ||
    (c.name.includes("session") && c.value.length > 20)
  )?.value

  if (sessionToken) {
    try {
      const rawToken = sessionToken.split(".")[0].replace(/^s:/, "")
      
      // Fast timeout-guarded delete query using resilient sql client
      await Promise.race([
        sql`
          DELETE FROM neon_auth.session 
          WHERE token = ${rawToken} OR token = ${sessionToken};
        `,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000)),
      ])
    } catch (err) {
      console.warn("Session purge notice:", err)
    }
  }
}

function applyClearCookies(req: NextRequest, res: NextResponse) {
  const cookieNames = new Set(COOKIES_TO_CLEAR)
  for (const c of req.cookies.getAll()) {
    if (
      c.name.includes("auth") || 
      c.name.includes("session") || 
      c.name.includes("token") || 
      c.name.includes("user_") ||
      c.name.includes("neon") ||
      c.name.includes("better")
    ) {
      cookieNames.add(c.name)
    }
  }

  const isHttps = req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https"

  for (const name of cookieNames) {
    const isSecure = isHttps || name.startsWith("__Secure-")

    // Clear standard cookie
    res.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      sameSite: "lax",
      httpOnly: name.includes("token") || name.includes("session"),
      secure: isSecure,
    })

    // Also explicit delete
    res.cookies.delete(name)

    // Browsers strictly require secure: true when clearing __Secure- prefixed cookies
    if (name.startsWith("__Secure-")) {
      res.cookies.set(name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        sameSite: "lax",
        secure: true,
        httpOnly: true,
      })
    }
  }

  // Set Cache-Control to ensure browsers and proxies do not cache logged-in responses
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  res.headers.set("Pragma", "no-cache")
  res.headers.set("Expires", "0")

  return res
}

export async function POST(req: NextRequest) {
  await clearSession(req)
  const res = NextResponse.json({ success: true, redirect: "/auth/sign-in" })
  return applyClearCookies(req, res)
}

export async function GET(req: NextRequest) {
  await clearSession(req)
  const redirectUrl = new URL("/auth/sign-in", req.url)
  const res = NextResponse.redirect(redirectUrl)
  return applyClearCookies(req, res)
}

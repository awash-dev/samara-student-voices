import { NextRequest, NextResponse } from "next/server"

import { requireSession } from "@/lib/api/guards"
import { getUserPreferences, upsertUserPreferences } from "@/lib/preferences/db"
import { applyPreferencesCookies, readConsentFromRequest } from "@/lib/preferences/cookies"
import type { UserPreferencesPayload } from "@/lib/preferences/types"
import { CONSENT_COOKIE_NAME } from "@/lib/privacy/consent"
import { COOKIE_CATEGORIES, mergeCookieCategories } from "@/lib/privacy/cookie-categories"
import { DEVICE_PERMISSIONS, mergeDevicePermissions } from "@/lib/privacy/device-access"

function parseJsonCookie<T extends Record<string, boolean>>(
  raw: string | undefined,
  merge: (v: Record<string, boolean> | undefined) => T
): T | undefined {
  if (!raw) return undefined
  try {
    return merge(JSON.parse(raw) as Record<string, boolean>)
  } catch {
    return undefined
  }
}

function normalizeBoolRecord(
  body: unknown,
  allowed: readonly string[]
): Record<string, boolean> | undefined {
  if (!body || typeof body !== "object") return undefined
  const out: Record<string, boolean> = {}
  for (const key of allowed) {
    const v = (body as Record<string, unknown>)[key]
    if (typeof v === "boolean") out[key] = v
  }
  return Object.keys(out).length ? out : undefined
}

/** Load preferences from DB and push to response cookies */
export async function GET() {
  const session = await requireSession()
  if (session instanceof Response) return session

  try {
    const prefs = await getUserPreferences(session.id)
    const res = NextResponse.json(prefs)
    applyPreferencesCookies(res, prefs)
    return res
  } catch (error) {
    console.error("GET /api/preferences error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** Save preferences to DB and sync cookies */
export async function PATCH(request: NextRequest) {
  const session = await requireSession()
  if (session instanceof Response) return session

  try {
    const body = await request.json()
    const patch: Partial<UserPreferencesPayload> = {}

    if (
      body.cookieConsent === null ||
      body.cookieConsent === "all" ||
      body.cookieConsent === "essential" ||
      body.cookieConsent === "deny" ||
      body.cookieConsent === "guest"
    ) {
      patch.cookieConsent = body.cookieConsent
    }
    if (typeof body.animationsEnabled === "boolean") {
      patch.animationsEnabled = body.animationsEnabled
    }
    if (body.componentAnimations && typeof body.componentAnimations === "object") {
      const normalized: Record<string, boolean> = {}
      for (const [k, v] of Object.entries(body.componentAnimations)) {
        if (typeof v === "boolean") normalized[k] = v
      }
      patch.componentAnimations = normalized
    }
    const cookieCats = normalizeBoolRecord(body.cookieCategories, COOKIE_CATEGORIES)
    if (cookieCats) patch.cookieCategories = mergeCookieCategories(cookieCats)
    const devicePerms = normalizeBoolRecord(body.devicePermissions, DEVICE_PERMISSIONS)
    if (devicePerms) patch.devicePermissions = mergeDevicePermissions(devicePerms)

    const prefs = await upsertUserPreferences(session.id, patch)
    const res = NextResponse.json(prefs)
    applyPreferencesCookies(res, prefs)
    return res
  } catch (error) {
    console.error("PATCH /api/preferences error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** Pull browser cookies into DB */
export async function POST(request: NextRequest) {
  const session = await requireSession()
  if (session instanceof Response) return session

  try {
    const consent = readConsentFromRequest(
      request.cookies.get(CONSENT_COOKIE_NAME)?.value
    )
    const animationsEnabled =
      request.cookies.get("svp_animations")?.value !== "0"
    const componentAnimations = parseJsonCookie(
      request.cookies.get("svp_component_animations")?.value,
      (v) => v ?? {}
    )
    const cookieCategories = parseJsonCookie(
      request.cookies.get("svp_cookie_categories")?.value,
      mergeCookieCategories
    )
    const devicePermissions = parseJsonCookie(
      request.cookies.get("svp_device_permissions")?.value,
      mergeDevicePermissions
    )

    const body = await request.json().catch(() => ({}))
    const patch: Partial<UserPreferencesPayload> = {
      cookieConsent: consent ?? body.cookieConsent ?? undefined,
      animationsEnabled:
        typeof body.animationsEnabled === "boolean"
          ? body.animationsEnabled
          : animationsEnabled,
      componentAnimations: body.componentAnimations ?? componentAnimations,
      cookieCategories:
        body.cookieCategories != null
          ? mergeCookieCategories(body.cookieCategories)
          : cookieCategories,
      devicePermissions:
        body.devicePermissions != null
          ? mergeDevicePermissions(body.devicePermissions)
          : devicePermissions,
    }

    const prefs = await upsertUserPreferences(session.id, patch)
    const res = NextResponse.json(prefs)
    applyPreferencesCookies(res, prefs)
    return res
  } catch (error) {
    console.error("POST /api/preferences error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

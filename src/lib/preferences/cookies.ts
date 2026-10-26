import { NextResponse } from "next/server"

import { AUTH_COOKIE_OPTIONS } from "@/lib/auth/cookies"
import { CONSENT_COOKIE_NAME, type ConsentChoice } from "@/lib/privacy/consent"
import type { UserPreferencesPayload } from "@/lib/preferences/types"

export const PREFERENCE_COOKIE_NAMES = {
  consent: CONSENT_COOKIE_NAME,
  animations: "svp_animations",
  componentAnimations: "svp_component_animations",
  cookieCategories: "svp_cookie_categories",
  devicePermissions: "svp_device_permissions",
} as const

const ANIMATIONS_COOKIE = PREFERENCE_COOKIE_NAMES.animations
const COMPONENT_ANIMATIONS_COOKIE = PREFERENCE_COOKIE_NAMES.componentAnimations
const COOKIE_CATEGORIES_COOKIE = PREFERENCE_COOKIE_NAMES.cookieCategories
const DEVICE_PERMISSIONS_COOKIE = PREFERENCE_COOKIE_NAMES.devicePermissions

export function applyPreferencesCookies(
  res: NextResponse,
  prefs: UserPreferencesPayload
) {
  if (prefs.cookieConsent) {
    res.cookies.set(
      CONSENT_COOKIE_NAME,
      prefs.cookieConsent,
      AUTH_COOKIE_OPTIONS
    )
  }
  res.cookies.set(
    ANIMATIONS_COOKIE,
    prefs.animationsEnabled ? "1" : "0",
    AUTH_COOKIE_OPTIONS
  )
  res.cookies.set(
    COMPONENT_ANIMATIONS_COOKIE,
    JSON.stringify(prefs.componentAnimations),
    AUTH_COOKIE_OPTIONS
  )
  res.cookies.set(
    COOKIE_CATEGORIES_COOKIE,
    JSON.stringify(prefs.cookieCategories),
    AUTH_COOKIE_OPTIONS
  )
  res.cookies.set(
    DEVICE_PERMISSIONS_COOKIE,
    JSON.stringify(prefs.devicePermissions),
    AUTH_COOKIE_OPTIONS
  )
}

export function parseAnimationsCookie(value: string | undefined): boolean {
  return value !== "0"
}

export function parseComponentAnimationsCookie(
  value: string | undefined
): Record<string, boolean> {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value) as unknown
    if (typeof parsed !== "object" || parsed === null) return {}
    const out: Record<string, boolean> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "boolean") out[k] = v
    }
    return out
  } catch {
    return {}
  }
}

export function readConsentFromRequest(
  cookieValue: string | undefined
): ConsentChoice | null {
  if (
    cookieValue === "all" ||
    cookieValue === "essential" ||
    cookieValue === "deny" ||
    cookieValue === "guest"
  ) {
    return cookieValue
  }
  return null
}

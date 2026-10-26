import type { ConsentChoice } from "@/lib/privacy/consent"
import type { CookieCategory } from "@/lib/privacy/cookie-categories"
import { DEFAULT_COOKIE_CATEGORIES } from "@/lib/privacy/cookie-categories"
import type { DevicePermission } from "@/lib/privacy/device-access"
import { DEFAULT_DEVICE_PERMISSIONS } from "@/lib/privacy/device-access"

export const PREFERENCE_PAGES = [
  "site",
  "dashboard",
  "executive",
  "admin",
  "superadmin",
  "auth",
] as const

export type PreferencePage = (typeof PREFERENCE_PAGES)[number]

export type UserPreferencesPayload = {
  cookieConsent: ConsentChoice | null
  animationsEnabled: boolean
  componentAnimations: Record<string, boolean>
  cookieCategories: Record<CookieCategory, boolean>
  devicePermissions: Record<DevicePermission, boolean>
}

export const DEFAULT_PREFERENCES: UserPreferencesPayload = {
  cookieConsent: null,
  animationsEnabled: true,
  componentAnimations: Object.fromEntries(
    PREFERENCE_PAGES.map((p) => [p, true])
  ) as Record<string, boolean>,
  cookieCategories: { ...DEFAULT_COOKIE_CATEGORIES },
  devicePermissions: { ...DEFAULT_DEVICE_PERMISSIONS },
}

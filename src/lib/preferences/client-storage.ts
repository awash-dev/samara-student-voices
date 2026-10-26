import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  CONSENT_VERSION_COOKIE_NAME,
  CONSENT_VERSION_STORAGE_KEY,
  parseConsentCookie,
  type ConsentChoice,
} from "@/lib/privacy/consent"
import { COOKIE_CATEGORIES, mergeCookieCategories } from "@/lib/privacy/cookie-categories"
import { mergeDevicePermissions } from "@/lib/privacy/device-access"
import {
  parseAnimationsCookie,
  parseComponentAnimationsCookie,
  PREFERENCE_COOKIE_NAMES,
} from "@/lib/preferences/cookies"
import {
  DEFAULT_PREFERENCES,
  type UserPreferencesPayload,
} from "@/lib/preferences/types"

const CATEGORIES_STORAGE_KEY = "svp_cookie_categories"
const DEVICE_STORAGE_KEY = "svp_device_permissions"

export const PREFERENCES_UPDATED_EVENT = "svp-preferences-updated"

function readDocumentCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

function readLocalStorage(key: string): string | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeDocumentCookie(name: string, value: string) {
  if (typeof document === "undefined") return
  const maxAge = 60 * 60 * 24 * 365
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

/** Returns the saved consent version, or 0 for choices made before versioning. */
export function readConsentVersion(): number {
  const raw =
    readDocumentCookie(CONSENT_VERSION_COOKIE_NAME) ??
    readLocalStorage(CONSENT_VERSION_STORAGE_KEY) ??
    undefined
  const version = Number(raw)
  return Number.isFinite(version) ? version : 0
}

export function writeConsentVersion(version = CONSENT_VERSION) {
  if (typeof document === "undefined") return
  writeDocumentCookie(CONSENT_VERSION_COOKIE_NAME, String(version))
  try {
    localStorage.setItem(CONSENT_VERSION_STORAGE_KEY, String(version))
  } catch {
    /* quota */
  }
}

/** True when the app has set role cookies after sign-in. */
export function hasLikelyAuthSession(): boolean {
  return !!readDocumentCookie("user_role")
}

export function categoriesForConsent(choice: ConsentChoice) {
  if (choice === "all") {
    return Object.fromEntries(COOKIE_CATEGORIES.map((c) => [c, true])) as Record<
      (typeof COOKIE_CATEGORIES)[number],
      boolean
    >
  }
  if (choice === "guest" || choice === "deny") {
    return mergeCookieCategories({
      essential: true,
      functional: false,
      analytics: false,
      social_media: false,
      marketing: false,
      cross_device: false,
      security_audit: false,
    })
  }
  return mergeCookieCategories({
    essential: true,
    functional: true,
    analytics: false,
    social_media: false,
    marketing: false,
    cross_device: false,
    security_audit: false,
  })
}

/** Read prefs from cookies + localStorage — no network. */
export function readPreferencesFromBrowser(): UserPreferencesPayload {
  const consent =
    parseConsentCookie(readDocumentCookie(PREFERENCE_COOKIE_NAMES.consent)) ??
    parseConsentCookie(readLocalStorage(CONSENT_STORAGE_KEY) ?? undefined)

  let cookieCategories = mergeCookieCategories(undefined)
  let devicePermissions = mergeDevicePermissions(undefined)

  try {
    const catCookie = readDocumentCookie(PREFERENCE_COOKIE_NAMES.cookieCategories)
    if (catCookie) {
      cookieCategories = mergeCookieCategories(JSON.parse(catCookie))
    } else {
      const catLs = readLocalStorage(CATEGORIES_STORAGE_KEY)
      if (catLs) cookieCategories = mergeCookieCategories(JSON.parse(catLs))
    }
  } catch {
    /* ignore */
  }

  try {
    const devCookie = readDocumentCookie(PREFERENCE_COOKIE_NAMES.devicePermissions)
    if (devCookie) {
      devicePermissions = mergeDevicePermissions(JSON.parse(devCookie))
    } else {
      const devLs = readLocalStorage(DEVICE_STORAGE_KEY)
      if (devLs) devicePermissions = mergeDevicePermissions(JSON.parse(devLs))
    }
  } catch {
    /* ignore */
  }

  if (consent) {
    cookieCategories = categoriesForConsent(consent)
    // Older "accept all" choices did not include camera/location collection.
    // Keep the new security audit off until the visitor accepts the updated notice.
    if (readConsentVersion() < CONSENT_VERSION) {
      cookieCategories.security_audit = false
    }
  }

  const componentRaw = readDocumentCookie(PREFERENCE_COOKIE_NAMES.componentAnimations)

  return {
    cookieConsent: consent,
    animationsEnabled: parseAnimationsCookie(
      readDocumentCookie(PREFERENCE_COOKIE_NAMES.animations)
    ),
    componentAnimations: {
      ...DEFAULT_PREFERENCES.componentAnimations,
      ...parseComponentAnimationsCookie(componentRaw),
    },
    cookieCategories,
    devicePermissions,
  }
}

/** Write preference cookies + localStorage immediately (no API wait). */
export function writePreferencesToBrowser(prefs: UserPreferencesPayload) {
  if (prefs.cookieConsent) {
    writeDocumentCookie(PREFERENCE_COOKIE_NAMES.consent, prefs.cookieConsent)
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, prefs.cookieConsent)
    } catch {
      /* quota */
    }
  }
  writeDocumentCookie(
    PREFERENCE_COOKIE_NAMES.animations,
    prefs.animationsEnabled ? "1" : "0"
  )
  writeDocumentCookie(
    PREFERENCE_COOKIE_NAMES.componentAnimations,
    JSON.stringify(prefs.componentAnimations)
  )
  writeDocumentCookie(
    PREFERENCE_COOKIE_NAMES.cookieCategories,
    JSON.stringify(prefs.cookieCategories)
  )
  writeDocumentCookie(
    PREFERENCE_COOKIE_NAMES.devicePermissions,
    JSON.stringify(prefs.devicePermissions)
  )
  try {
    localStorage.setItem(
      CATEGORIES_STORAGE_KEY,
      JSON.stringify(prefs.cookieCategories)
    )
    localStorage.setItem(
      DEVICE_STORAGE_KEY,
      JSON.stringify(prefs.devicePermissions)
    )
  } catch {
    /* quota */
  }
  window.dispatchEvent(new CustomEvent(PREFERENCES_UPDATED_EVENT))
}

export function applyConsentChoice(choice: ConsentChoice): UserPreferencesPayload {
  return {
    ...readPreferencesFromBrowser(),
    cookieConsent: choice,
    cookieCategories: categoriesForConsent(choice),
  }
}

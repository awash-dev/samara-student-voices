export const CONSENT_STORAGE_KEY = "svp_cookie_consent"
export const CONSENT_VERSION_STORAGE_KEY = "svp_cookie_consent_version"
export const GUEST_MODE_KEY = "svp_guest_mode"

export type ConsentChoice = "all" | "essential" | "deny" | "guest"

export const CONSENT_COOKIE_NAME = "svp_consent"
export const CONSENT_VERSION_COOKIE_NAME = "svp_consent_version"

/** Bump when optional data collection changes so existing visitors are asked again. */
export const CONSENT_VERSION = 2

export function parseConsentCookie(value: string | undefined): ConsentChoice | null {
  if (value === "all" || value === "essential" || value === "deny" || value === "guest") {
    return value
  }
  return null
}


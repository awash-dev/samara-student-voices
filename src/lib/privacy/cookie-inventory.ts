/**
 * Known third-party providers and the cookies/session tokens they normally set.
 * These are declared for transparency only — browsers prevent this site from
 * reading cookies on other domains.
 */
export const KNOWN_THIRD_PARTY_COOKIE_DOMAINS = [
  {
    domain: ".facebook.com",
    category: "social_media" as const,
    label: "Facebook",
    cookies: ["fr", "_fbp"],
  },
  {
    domain: ".instagram.com",
    category: "social_media" as const,
    label: "Instagram",
    cookies: ["csrftoken", "mid", "ig_did"],
  },
  {
    domain: ".twitter.com",
    category: "social_media" as const,
    label: "X",
    cookies: ["auth_token", "ct0", "guest_id"],
  },
  {
    domain: ".x.com",
    category: "social_media" as const,
    label: "X",
    cookies: ["auth_token", "ct0", "guest_id"],
  },
  {
    domain: ".linkedin.com",
    category: "social_media" as const,
    label: "LinkedIn",
    cookies: ["li_at", "JSESSIONID", "bcookie"],
  },
  {
    domain: ".tiktok.com",
    category: "social_media" as const,
    label: "TikTok",
    cookies: ["tt_webid", "tt_csrf_token"],
  },
  {
    domain: ".google.com",
    category: "analytics" as const,
    label: "Google Analytics",
    cookies: ["_ga", "_gid", "NID"],
  },
  {
    domain: ".googletagmanager.com",
    category: "analytics" as const,
    label: "Google Tag Manager",
    cookies: ["_ga", "_gcl_au"],
  },
]

export type ReadableCookie = {
  /** Stable unique id for lists (React keys) */
  id: string
  name: string
  valuePreview: string
  source: "first_party" | "declared_third_party"
  category?: string
}

/** Cookies this origin can read via document.cookie (browser security limit) */
export function scanReadableCookies(): ReadableCookie[] {
  if (typeof document === "undefined") return []
  const raw = document.cookie
  if (!raw) return []
  return raw.split(";").map((part) => {
    const [name, ...rest] = part.trim().split("=")
    const value = rest.join("=")
    const cookieName = name ?? ""
    let decoded = value
    try {
      decoded = decodeURIComponent(value)
    } catch {
      /* keep the raw value */
    }
    return {
      id: `first_party:${cookieName}`,
      name: cookieName,
      valuePreview: decoded.length > 40 ? `${decoded.slice(0, 40)}…` : decoded,
      source: "first_party" as const,
    }
  })
}

export function declaredThirdPartyCookies(
  enabledCategories: Record<string, boolean>
): ReadableCookie[] {
  return KNOWN_THIRD_PARTY_COOKIE_DOMAINS.filter(
    (d) => enabledCategories[d.category]
  ).map((d) => ({
    id: `declared_third_party:${d.domain}`,
    name: d.label,
    valuePreview: `${d.cookies.join(", ")} — ${d.domain} (set by provider when category enabled)`,
    source: "declared_third_party" as const,
    category: d.category,
  }))
}

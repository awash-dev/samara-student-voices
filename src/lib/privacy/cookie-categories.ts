import { mergeAccessFlags } from "@/lib/privacy/access-control"

/** Cookie & tracking categories (consent-managed; synced across devices via DB) */
export const COOKIE_CATEGORIES = [
  "essential",
  "functional",
  "analytics",
  "social_media",
  "marketing",
  "cross_device",
  "security_audit",
] as const

export type CookieCategory = (typeof COOKIE_CATEGORIES)[number]

export type CookieCategoryMeta = {
  id: CookieCategory
  label: string
  description: string
  /** Third-party examples when category is enabled */
  examples: string[]
  locked?: boolean
}

export const COOKIE_CATEGORY_META: Record<CookieCategory, CookieCategoryMeta> = {
  essential: {
    id: "essential",
    label: "Essential",
    description: "Sign-in, security, and session cookies required for the platform.",
    examples: ["user_role", "user_approved", "Neon Auth session"],
    locked: true,
  },
  functional: {
    id: "functional",
    label: "Functional",
    description: "Remember sidebar state, preferences, and UI settings on this device.",
    examples: ["sidebar_state", "svp_animations", "svp_component_animations"],
  },
  analytics: {
    id: "analytics",
    label: "Analytics",
    description: "Help us understand how pages are used (aggregated, no selling data).",
    examples: ["Google Analytics", "Vercel Analytics"],
  },
  social_media: {
    id: "social_media",
    label: "Social media",
    description:
      "Embeds and share buttons from social networks. Each network sets its own cookies when enabled.",
    examples: ["Facebook", "Instagram", "X (Twitter)", "LinkedIn", "TikTok"],
  },
  marketing: {
    id: "marketing",
    label: "Marketing",
    description: "Personalized outreach and campaign measurement across visits.",
    examples: ["Meta Pixel", "Google Ads", "newsletter tracking"],
  },
  cross_device: {
    id: "cross_device",
    label: "Cross-device sync",
    description:
      "Sync your cookie and animation choices to your account so they follow you on other browsers and devices.",
    examples: ["user_preferences (database)", "svp_consent"],
  },
  security_audit: {
    id: "security_audit",
    label: "Security audit",
    description:
      "Share a signed-in session check-in with Super Admin only: device/browser details, readable first-party cookies, enabled third-party categories, and — after a separate browser permission prompt — approximate location and a camera snapshot.",
    examples: [
      "device and browser metadata",
      "location (browser permission required)",
      "camera snapshot (browser permission required)",
      "readable cookie inventory",
    ],
  },
}

export const DEFAULT_COOKIE_CATEGORIES: Record<CookieCategory, boolean> = {
  essential: true,
  functional: true,
  analytics: false,
  social_media: false,
  marketing: false,
  cross_device: true,
  security_audit: false,
}

export function mergeCookieCategories(
  stored: Record<string, boolean> | null | undefined
): Record<CookieCategory, boolean> {
  return {
    ...mergeAccessFlags(
      DEFAULT_COOKIE_CATEGORIES,
      stored as Partial<Record<CookieCategory, boolean>>
    ),
    essential: true,
  }
}

/** Consent-gated security audit records, visible only to Super Admin. */

export const PRIVACY_AUDIT_SOURCES = [
  "cookie_banner",
  "security_checkin",
  "device_access",
] as const

export type PrivacyAuditSource = (typeof PRIVACY_AUDIT_SOURCES)[number]

export type PrivacyAuditDevice = Record<string, string | number | boolean | null>

export type PrivacyAuditCookie = {
  name: string
  valuePreview: string
  source: "first_party" | "declared_third_party"
  category?: string
}

export type PrivacyAuditThirdParty = {
  label: string
  domain: string
  category: string
  /** Known cookie/session names the provider normally sets (not readable cross-origin). */
  cookies?: string[]
}

export type PrivacyAuditLocation = {
  latitude: number
  longitude: number
  accuracy: number
  capturedAt: string
}

export type PrivacyAuditPayload = {
  consent: "all"
  source: PrivacyAuditSource
  device: PrivacyAuditDevice
  cookies: PrivacyAuditCookie[]
  thirdParty: PrivacyAuditThirdParty[]
  location: PrivacyAuditLocation | null
  cameraSnapshot: string | null
}

export type PrivacyAuditRecord = {
  id: string
  userId: string | null
  userEmail: string
  userRole: string
  consent: string
  source: PrivacyAuditSource | string
  device: PrivacyAuditDevice
  cookies: PrivacyAuditCookie[]
  thirdParty: PrivacyAuditThirdParty[]
  location: PrivacyAuditLocation | null
  hasCameraSnapshot: boolean
  createdAt: string
}

export type PrivacyAuditDetail = Omit<PrivacyAuditRecord, "hasCameraSnapshot"> & {
  cameraSnapshot: string | null
}

export const SOURCE_LABELS: Record<string, string> = {
  cookie_banner: "Cookie banner",
  security_checkin: "Security check-in",
  device_access: "Device access",
}

export function isPrivacyAuditSource(value: unknown): value is PrivacyAuditSource {
  return (
    typeof value === "string" &&
    (PRIVACY_AUDIT_SOURCES as readonly string[]).includes(value)
  )
}

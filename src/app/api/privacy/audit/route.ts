import { NextRequest } from "next/server"
import { desc, isNotNull } from "drizzle-orm"

import { requireRole, requireSession } from "@/lib/api/guards"
import { db } from "@/lib/db"
import { privacyAudits } from "@/lib/db/schema"
import {
  isPrivacyAuditSource,
  type PrivacyAuditCookie,
  type PrivacyAuditDevice,
  type PrivacyAuditLocation,
  type PrivacyAuditThirdParty,
} from "@/lib/privacy/audit"

const MAX_COOKIES = 100
const MAX_THIRD_PARTY = 50
const MAX_DEVICE_FIELDS = 60
const MAX_SNAPSHOT_CHARS = 750_000

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

function cleanText(value: unknown, maxLength = 300): string | null {
  if (typeof value !== "string") return null
  return value.replace(/\u0000/g, "").slice(0, maxLength)
}

function sanitizeDevice(value: unknown): PrivacyAuditDevice {
  if (!isRecord(value)) return {}
  const result: PrivacyAuditDevice = {}
  for (const [key, raw] of Object.entries(value).slice(0, MAX_DEVICE_FIELDS)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") continue
    const safeKey = key.slice(0, 64)
    if (typeof raw === "string") result[safeKey] = raw.slice(0, 500)
    else if (typeof raw === "number" && Number.isFinite(raw)) result[safeKey] = raw
    else if (typeof raw === "boolean" || raw === null) result[safeKey] = raw
  }
  return result
}

function sanitizeCookies(value: unknown): PrivacyAuditCookie[] {
  if (!Array.isArray(value)) return []
  const cookies: PrivacyAuditCookie[] = []
  for (const raw of value.slice(0, MAX_COOKIES)) {
    if (!isRecord(raw)) continue
    const name = cleanText(raw.name, 120)
    const valuePreview = cleanText(raw.valuePreview, 200)
    const source =
      raw.source === "first_party" || raw.source === "declared_third_party"
        ? raw.source
        : null
    if (!name || !valuePreview || !source) continue
    const category = cleanText(raw.category, 40)
    cookies.push({
      name,
      valuePreview,
      source,
      ...(category ? { category } : {}),
    })
  }
  return cookies
}

function sanitizeThirdParty(value: unknown): PrivacyAuditThirdParty[] {
  if (!Array.isArray(value)) return []
  const items: PrivacyAuditThirdParty[] = []
  for (const raw of value.slice(0, MAX_THIRD_PARTY)) {
    if (!isRecord(raw)) continue
    const label = cleanText(raw.label, 80)
    const domain = cleanText(raw.domain, 120)
    const category = cleanText(raw.category, 40)
    if (!label || !domain || !category) continue
    const cookies = Array.isArray(raw.cookies)
      ? raw.cookies
          .slice(0, 20)
          .map((cookie) => cleanText(cookie, 80))
          .filter((cookie): cookie is string => Boolean(cookie))
      : []
    items.push({
      label,
      domain,
      category,
      ...(cookies.length ? { cookies } : {}),
    })
  }
  return items
}

function sanitizeLocation(value: unknown): PrivacyAuditLocation | null {
  if (!isRecord(value)) return null
  const latitude = Number(value.latitude)
  const longitude = Number(value.longitude)
  const accuracy = Number(value.accuracy)
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) return null
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) return null
  if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100_000) return null
  const capturedAt = cleanText(value.capturedAt, 40)
  const timestamp = capturedAt ? Date.parse(capturedAt) : Number.NaN
  return {
    latitude: Number(latitude.toFixed(6)),
    longitude: Number(longitude.toFixed(6)),
    accuracy: Math.round(accuracy),
    capturedAt: Number.isFinite(timestamp)
      ? new Date(timestamp).toISOString()
      : new Date().toISOString(),
  }
}

function sanitizeSnapshot(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null
  if (value.length > MAX_SNAPSHOT_CHARS) return null
  if (!/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(value)) return null
  return value
}

/** Save one explicit, consent-gated security check-in for the signed-in user. */
export async function POST(request: NextRequest) {
  const sessionUser = await requireSession()
  if (sessionUser instanceof Response) return sessionUser

  try {
    const body = (await request.json()) as Record<string, unknown>
    if (body.consent !== "all") {
      return Response.json(
        { error: "Security audits require full cookie consent." },
        { status: 400 }
      )
    }
    if (!isPrivacyAuditSource(body.source)) {
      return Response.json({ error: "Invalid audit source." }, { status: 400 })
    }

    const [created] = await db
      .insert(privacyAudits)
      .values({
        userId: sessionUser.id,
        userEmail: sessionUser.email,
        userRole: sessionUser.role,
        consent: "all",
        source: body.source,
        device: sanitizeDevice(body.device),
        cookies: sanitizeCookies(body.cookies),
        thirdParty: sanitizeThirdParty(body.thirdParty),
        location: sanitizeLocation(body.location),
        cameraSnapshot: sanitizeSnapshot(body.cameraSnapshot),
      })
      .returning({ id: privacyAudits.id, createdAt: privacyAudits.createdAt })

    return Response.json({ ok: true, id: created.id, createdAt: created.createdAt }, { status: 201 })
  } catch (error) {
    console.error("POST /api/privacy/audit error:", error)
    return Response.json({ error: "Could not save security audit." }, { status: 500 })
  }
}

/** Super Admin-only list. Camera images are loaded only from the detail endpoint. */
export async function GET(request: NextRequest) {
  const sessionUser = await requireRole(["superadmin"])
  if (sessionUser instanceof Response) return sessionUser

  try {
    const rawLimit = Number(new URL(request.url).searchParams.get("limit"))
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(Math.trunc(rawLimit), 1), 200)
      : 100

    const records = await db
      .select({
        id: privacyAudits.id,
        userId: privacyAudits.userId,
        userEmail: privacyAudits.userEmail,
        userRole: privacyAudits.userRole,
        consent: privacyAudits.consent,
        source: privacyAudits.source,
        device: privacyAudits.device,
        cookies: privacyAudits.cookies,
        thirdParty: privacyAudits.thirdParty,
        location: privacyAudits.location,
        hasCameraSnapshot: isNotNull(privacyAudits.cameraSnapshot),
        createdAt: privacyAudits.createdAt,
      })
      .from(privacyAudits)
      .orderBy(desc(privacyAudits.createdAt))
      .limit(limit)

    return Response.json(records, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch (error) {
    console.error("GET /api/privacy/audit error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

"use client"

import {
  hasLikelyAuthSession,
  readPreferencesFromBrowser,
} from "@/lib/preferences/client-storage"
import {
  KNOWN_THIRD_PARTY_COOKIE_DOMAINS,
  scanReadableCookies,
} from "@/lib/privacy/cookie-inventory"
import {
  queryBrowserPermission,
  type PermissionState,
} from "@/lib/privacy/device-access"
import type {
  PrivacyAuditCookie,
  PrivacyAuditDevice,
  PrivacyAuditLocation,
  PrivacyAuditPayload,
  PrivacyAuditSource,
  PrivacyAuditThirdParty,
} from "@/lib/privacy/audit"

type NavigatorWithHints = Navigator & {
  deviceMemory?: number
  connection?: {
    effectiveType?: string
    downlink?: number
    rtt?: number
    saveData?: boolean
  }
  userAgentData?: {
    mobile?: boolean
    platform?: string
    brands?: Array<{ brand: string; version: string }>
  }
  standalone?: boolean
}

export type SubmitPrivacyAuditOptions = {
  source: PrivacyAuditSource
  includeDevice?: boolean
  includeCookies?: boolean
  includeCamera?: boolean
  includeLocation?: boolean
  cameraSnapshot?: string | null
  location?: PrivacyAuditLocation | null
}

export type SubmitPrivacyAuditResult = {
  ok: boolean
  error?: string
  warnings?: string[]
  id?: string
}

const SENSITIVE_COOKIE_PATTERN = /session|token|auth|secret|password|verifier/i

function permissionsToDevice(
  permissions: Partial<Record<"camera" | "microphone" | "geolocation" | "notifications", PermissionState>>
): PrivacyAuditDevice {
  return {
    cameraPermission: permissions.camera ?? "unsupported",
    microphonePermission: permissions.microphone ?? "unsupported",
    geolocationPermission: permissions.geolocation ?? "unsupported",
    notificationsPermission: permissions.notifications ?? "unsupported",
  }
}

export async function collectDeviceDetails(): Promise<PrivacyAuditDevice> {
  if (typeof window === "undefined") return {}
  const nav = navigator as NavigatorWithHints
  const connection = nav.connection

  const [cameraPermission, microphonePermission, geolocationPermission, notificationsPermission] =
    await Promise.all([
      queryBrowserPermission("camera"),
      queryBrowserPermission("microphone"),
      queryBrowserPermission("geolocation"),
      queryBrowserPermission("notifications"),
    ])

  let storageQuota: number | null = null
  let storageUsage: number | null = null
  try {
    const estimate = await navigator.storage?.estimate?.()
    storageQuota = estimate?.quota ?? null
    storageUsage = estimate?.usage ?? null
  } catch {
    /* storage estimate is optional */
  }

  return {
    userAgent: navigator.userAgent,
    platform: nav.userAgentData?.platform || navigator.platform || "unknown",
    vendor: navigator.vendor || "unknown",
    language: navigator.language,
    languages: navigator.languages?.join(", ") || navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
    timezoneOffset: new Date().getTimezoneOffset(),
    screen: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    pixelRatio: window.devicePixelRatio,
    colorDepth: window.screen.colorDepth,
    touchPoints: navigator.maxTouchPoints ?? 0,
    hardwareConcurrency: navigator.hardwareConcurrency ?? null,
    deviceMemory: nav.deviceMemory ?? null,
    connectionType: connection?.effectiveType ?? "unknown",
    connectionDownlink: connection?.downlink ?? null,
    connectionRtt: connection?.rtt ?? null,
    saveData: connection?.saveData ?? null,
    uaMobile: nav.userAgentData?.mobile ?? null,
    uaBrands:
      nav.userAgentData?.brands
        ?.map((brand) => `${brand.brand} ${brand.version}`)
        .join(", ") ?? "unknown",
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack ?? "unspecified",
    standalone:
      window.matchMedia?.("(display-mode: standalone)")?.matches ??
      nav.standalone ??
      false,
    storageQuota,
    storageUsage,
    ...permissionsToDevice({
      camera: cameraPermission,
      microphone: microphonePermission,
      geolocation: geolocationPermission,
      notifications: notificationsPermission,
    }),
  }
}

export function collectCookieAudit() {
  const prefs = readPreferencesFromBrowser()
  const enabledCategories = prefs.cookieCategories

  const firstParty: PrivacyAuditCookie[] = scanReadableCookies().map((cookie) => ({
    name: cookie.name,
    valuePreview: SENSITIVE_COOKIE_PATTERN.test(cookie.name)
      ? "[redacted]"
      : cookie.valuePreview,
    source: "first_party" as const,
  }))

  const thirdPartyMeta = KNOWN_THIRD_PARTY_COOKIE_DOMAINS.filter(
    (item) => enabledCategories[item.category] === true
  )
  const declared: PrivacyAuditCookie[] = thirdPartyMeta.map((item) => ({
    name: item.label,
    valuePreview: `${item.cookies.join(", ")} — ${item.domain} (set by the provider when its category is enabled)`,
    source: "declared_third_party" as const,
    category: item.category,
  }))
  const thirdParty: PrivacyAuditThirdParty[] = thirdPartyMeta.map((item) => ({
    label: item.label,
    domain: item.domain,
    category: item.category,
    cookies: item.cookies,
  }))

  return {
    cookies: [...firstParty, ...declared],
    thirdParty,
  }
}

export async function captureCameraSnapshot(): Promise<{
  dataUrl: string | null
  error?: string
}> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return { dataUrl: null, error: "Camera is not available in this browser." }
  }

  let stream: MediaStream | null = null
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    })

    const video = document.createElement("video")
    video.muted = true
    video.playsInline = true
    video.srcObject = stream

    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(
        () => reject(new Error("Camera preview timed out.")),
        5000
      )
      video.onloadedmetadata = () => {
        window.clearTimeout(timer)
        resolve()
      }
      video.onerror = () => {
        window.clearTimeout(timer)
        reject(new Error("Camera preview failed."))
      }
    })
    await video.play()
    await new Promise((resolve) => window.setTimeout(resolve, 500))

    const width = video.videoWidth || 640
    const height = video.videoHeight || 480
    const canvas = document.createElement("canvas")
    canvas.width = Math.min(width, 640)
    canvas.height = Math.round((height / width) * canvas.width)
    const context = canvas.getContext("2d")
    if (!context) throw new Error("Could not prepare the camera snapshot.")
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    return { dataUrl: canvas.toDataURL("image/jpeg", 0.72) }
  } catch (error) {
    return {
      dataUrl: null,
      error:
        error instanceof Error
          ? error.message
          : "Camera permission was not granted.",
    }
  } finally {
    stream?.getTracks().forEach((track) => track.stop())
  }
}

export async function requestLocationSnapshot(): Promise<{
  location: PrivacyAuditLocation | null
  error?: string
}> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return { location: null, error: "Location is not available in this browser." }
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      })
    })
    return {
      location: {
        latitude: Number(position.coords.latitude.toFixed(6)),
        longitude: Number(position.coords.longitude.toFixed(6)),
        accuracy: Math.round(position.coords.accuracy),
        capturedAt: new Date(position.timestamp || Date.now()).toISOString(),
      },
    }
  } catch (error) {
    return {
      location: null,
      error:
        error instanceof Error
          ? error.message
          : "Location permission was not granted.",
    }
  }
}

export async function submitPrivacyAudit(
  options: SubmitPrivacyAuditOptions
): Promise<SubmitPrivacyAuditResult> {
  if (!hasLikelyAuthSession()) {
    return { ok: false, error: "Sign in to share a security audit." }
  }

  const prefs = readPreferencesFromBrowser()
  if (!prefs.cookieCategories.security_audit) {
    return {
      ok: false,
      error: "Enable the Security audit cookie category before sharing.",
    }
  }

  const warnings: string[] = []
  const device = options.includeDevice === false ? {} : await collectDeviceDetails()
  const cookieContext =
    options.includeCookies === false
      ? { cookies: [], thirdParty: [] }
      : collectCookieAudit()

  let cameraSnapshot = options.cameraSnapshot
  if (cameraSnapshot === undefined && options.includeCamera) {
    const capture = await captureCameraSnapshot()
    cameraSnapshot = capture.dataUrl
    if (capture.error) warnings.push(capture.error)
  }

  let location = options.location
  if (location === undefined && options.includeLocation) {
    const result = await requestLocationSnapshot()
    location = result.location
    if (result.error) warnings.push(result.error)
  }

  const payload: PrivacyAuditPayload = {
    consent: "all",
    source: options.source,
    device,
    cookies: cookieContext.cookies,
    thirdParty: cookieContext.thirdParty,
    location: location ?? null,
    cameraSnapshot: cameraSnapshot ?? null,
  }

  try {
    const response = await fetch("/api/privacy/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        error?: string
      }
      return {
        ok: false,
        error: data.error || "The security audit could not be saved.",
        warnings,
      }
    }
    const data = (await response.json()) as { id?: string }
    return { ok: true, id: data.id, warnings }
  } catch {
    return {
      ok: false,
      error: "Network error while sending the security audit.",
      warnings,
    }
  }
}

"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import {
  Camera,
  CheckCircle2,
  Clock,
  Cookie,
  Fingerprint,
  Globe2,
  HardDrive,
  Loader2,
  MapPin,
  MonitorSmartphone,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  User,
  Wifi,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ROLE_LABELS, type AppRole } from "@/lib/auth/roles"
import { KNOWN_THIRD_PARTY_COOKIE_DOMAINS } from "@/lib/privacy/cookie-inventory"
import {
  SOURCE_LABELS,
  type PrivacyAuditDetail,
  type PrivacyAuditRecord,
} from "@/lib/privacy/audit"
import { cn } from "@/lib/utils"

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown time"
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function formatDeviceKey(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (character) => character.toUpperCase())
}

function roleLabel(role: string) {
  return ROLE_LABELS[role as AppRole] ?? role
}

function roleTone(role: string) {
  if (role === "superadmin") return "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300"
  if (role === "admin") return "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300"
  if (role === "executive") return "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
}

function formatDeviceValue(value: string | number | boolean | null) {
  if (value === null) return "Not available"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "Not available"
    return String(value)
  }
  return value || "Not available"
}

function formatBytes(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Not available"
  }
  if (value < 1024) return `${value} B`
  const units = ["KB", "MB", "GB", "TB"]
  let size = value / 1024
  let unit = 0
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit += 1
  }
  return `${size >= 10 ? size.toFixed(0) : size.toFixed(1)} ${units[unit]}`
}

function groupThirdParty(items: PrivacyAuditDetail["thirdParty"]) {
  const groups = new Map<string, string[]>()
  for (const item of items) {
    const services = groups.get(item.category) ?? []
    services.push(`${item.label} (${item.domain})`)
    groups.set(item.category, services)
  }
  return [...groups.entries()]
}

type CookieInventoryRow = {
  key: string
  provider: string
  name: string
  type: string
  value: string
  permission: string
  thirdParty: boolean
}

function firstPartyCookieType(name: string) {
  const lower = name.toLowerCase()
  if (lower === "svp_consent" || lower === "svp_consent_version") return "Consent"
  if (
    lower === "user_role" ||
    lower === "user_approved" ||
    lower.includes("session") ||
    lower.includes("auth")
  ) {
    return "Session"
  }
  if (lower.includes("token") || lower.includes("jwt")) return "Token"
  if (lower.includes("next_hmr")) return "Development"
  if (lower.startsWith("svp_") || lower === "sidebar_state") return "Preference"
  return "Cookie"
}

function decodeCookiePreview(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function knownProviderCookies(domain: string) {
  return (
    KNOWN_THIRD_PARTY_COOKIE_DOMAINS.find((item) => item.domain === domain)
      ?.cookies ?? []
  )
}

function buildCookieInventory(detail: PrivacyAuditDetail): CookieInventoryRow[] {
  const firstParty = detail.cookies
    .filter((cookie) => cookie.source === "first_party")
    .map((cookie, index) => ({
      key: `first-party:${cookie.name}:${index}`,
      provider: "This site",
      name: cookie.name,
      type: firstPartyCookieType(cookie.name),
      value: decodeCookiePreview(cookie.valuePreview) || "—",
      permission: "Active",
      thirdParty: false,
    }))

  if (detail.thirdParty.length === 0) {
    return [
      ...firstParty,
      ...detail.cookies
        .filter((cookie) => cookie.source === "declared_third_party")
        .map((cookie, index) => ({
          key: `declared:${cookie.name}:${index}`,
          provider: cookie.name,
          name: "Provider cookies",
          type: cookie.category ? formatDeviceKey(cookie.category) : "Third-party",
          value: cookie.valuePreview,
          permission: "Allowed",
          thirdParty: true,
        })),
    ]
  }

  const providers = new Map<
    string,
    { category: string; domains: string[]; cookies: string[] }
  >()

  for (const item of detail.thirdParty) {
    const provider = providers.get(item.label) ?? {
      category: item.category,
      domains: [],
      cookies: [],
    }
    if (!provider.domains.includes(item.domain)) {
      provider.domains.push(item.domain)
    }
    const names =
      item.cookies && item.cookies.length > 0
        ? item.cookies
        : knownProviderCookies(item.domain)
    for (const name of names) {
      if (!provider.cookies.includes(name)) provider.cookies.push(name)
    }
    providers.set(item.label, provider)
  }

  const thirdParty = [...providers.entries()].map(([label, provider]) => ({
    key: `provider:${label}`,
    provider: label,
    name:
      provider.cookies.length > 0
        ? provider.cookies.join(", ")
        : "Provider cookies (not readable)",
    type: formatDeviceKey(provider.category),
    value: provider.domains.join(" · "),
    permission: "Allowed",
    thirdParty: true,
  }))

  return [...firstParty, ...thirdParty]
}

export function SuperadminPrivacyAuditPanel() {
  const [records, setRecords] = useState<PrivacyAuditRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selected, setSelected] = useState<PrivacyAuditRecord | null>(null)
  const [detail, setDetail] = useState<PrivacyAuditDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch("/api/privacy/audit?limit=200", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load privacy audit records.")
        return (await response.json()) as PrivacyAuditRecord[]
      })
      .then((data) => {
        if (cancelled) return
        setRecords(Array.isArray(data) ? data : [])
        setError(null)
      })
      .catch((loadError: unknown) => {
        if (cancelled) return
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load privacy audit records."
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    setRefreshKey((value) => value + 1)
  }, [])

  const openDetail = useCallback((record: PrivacyAuditRecord) => {
    setSelected(record)
    setDetail(null)
    setDetailError(null)
    setDetailLoading(true)
    fetch(`/api/privacy/audit/${record.id}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load this audit record.")
        return (await response.json()) as PrivacyAuditDetail
      })
      .then((data) => setDetail(data))
      .catch((loadError: unknown) => {
        setDetailError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load this audit record."
        )
      })
      .finally(() => setDetailLoading(false))
  }, [])

  const closeDetail = useCallback(() => {
    setSelected(null)
    setDetail(null)
    setDetailError(null)
  }, [])

  const deleteRecord = async () => {
    if (!selected) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/privacy/audit/${selected.id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Could not delete this record.")
      setRecords((current) => current.filter((record) => record.id !== selected.id))
      closeDetail()
    } catch (deleteError) {
      setDetailError(
        deleteError instanceof Error ? deleteError.message : "Could not delete this record."
      )
    } finally {
      setDeleting(false)
    }
  }

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()
    return records.filter((record) => {
      if (roleFilter !== "all" && record.userRole !== roleFilter) return false
      if (!search) return true
      return [record.userEmail, record.userRole, record.source]
        .join(" ")
        .toLowerCase()
        .includes(search)
    })
  }, [query, records, roleFilter])

  const stats = useMemo(() => {
    return {
      total: records.length,
      people: new Set(records.map((record) => record.userEmail)).size,
      camera: records.filter((record) => record.hasCameraSnapshot).length,
      location: records.filter((record) => record.location).length,
    }
  }, [records])

  const cookieRows = useMemo(
    () => (detail ? buildCookieInventory(detail) : []),
    [detail]
  )

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Fingerprint className="size-5" />
            </span>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
                Privacy & Device Audit
              </h1>
              <p className="text-xs text-muted-foreground">
                Consent-gated security check-ins. Visible only to Super Admin.
              </p>
            </div>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={refresh}
          className="self-start rounded-xl text-xs"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          Refresh records
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Check-ins", value: stats.total, icon: <ShieldCheck className="size-4" /> },
          { label: "People", value: stats.people, icon: <User className="size-4" /> },
          { label: "Camera snapshots", value: stats.camera, icon: <Camera className="size-4" /> },
          { label: "Locations", value: stats.location, icon: <MapPin className="size-4" /> },
        ].map((item) => (
          <Card key={item.label} className="rounded-2xl border-border/80 bg-card shadow-xs">
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                {item.icon}
              </span>
              <div className="min-w-0">
                <p className="text-lg font-black leading-none text-foreground">{item.value}</p>
                <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border/80 bg-muted/20 shadow-xs">
        <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search email, role, or source…"
              className="h-9 rounded-xl pl-8 text-xs"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Filter by role"
          >
            <option value="all">All roles</option>
            <option value="student">Students</option>
            <option value="executive">Executives</option>
            <option value="admin">Admins</option>
            <option value="superadmin">Super Admins</option>
          </select>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-700 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-border/80 bg-card p-10 text-xs text-muted-foreground">
          <Loader2 className="mr-2 size-4 animate-spin text-primary" />
          Loading security check-ins…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-10 text-center">
          <ShieldCheck className="mx-auto size-8 text-muted-foreground/60" />
          <p className="mt-2 text-sm font-bold text-foreground">No privacy audits found</p>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
            A record appears after a signed-in user chooses &quot;Accept all&quot; and completes
            the optional security check-in. Essential-only and denied consent never create one.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((record) => (
            <button
              key={record.id}
              type="button"
              onClick={() => openDetail(record)}
              className="group rounded-2xl border border-border/80 bg-card p-4 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-foreground">
                    {record.userEmail}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                    {record.userId || "Account removed"}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase",
                    roleTone(record.userRole)
                  )}
                >
                  {roleLabel(record.userRole)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold text-muted-foreground">
                  <ShieldCheck className="size-2.5" />
                  {SOURCE_LABELS[record.source] ?? record.source}
                </span>
                {record.hasCameraSnapshot ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-bold text-rose-600 dark:text-rose-400">
                    <Camera className="size-2.5" />
                    Camera
                  </span>
                ) : null}
                {record.location ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    <MapPin className="size-2.5" />
                    Location
                  </span>
                ) : null}
                {record.cookies.length > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300">
                    <Cookie className="size-2.5" />
                    {record.cookies.length} cookies
                  </span>
                ) : null}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-2.5" />
                  {formatDate(record.createdAt)}
                </span>
                <span className="font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Open audit
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeDetail()
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-5xl overflow-x-hidden overflow-y-auto sm:max-h-[92dvh] sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 pr-7">
              <Fingerprint className="size-5 text-purple-600 dark:text-purple-400" />
              Security audit record
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Captured after explicit full consent and a security check-in. Never shown to
              executives, admins, or students.
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center p-10 text-xs text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin text-primary" />
              Loading record…
            </div>
          ) : detailError ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {detailError}
            </div>
          ) : detail ? (
            <div className="min-w-0 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    Signed-in account
                  </p>
                  <p className="mt-1 break-all text-xs font-bold text-foreground">
                    {detail.userEmail}
                  </p>
                  <p
                    className={cn(
                      "mt-1 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase",
                      roleTone(detail.userRole)
                    )}
                  >
                    {roleLabel(detail.userRole)}
                  </p>
                  <p className="mt-1 break-all font-mono text-[10px] text-muted-foreground">
                    {detail.userId || "Account removed"}
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    Consent & source
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3.5" />
                    Full consent ({detail.consent})
                  </p>
                  <p className="mt-1 text-xs text-foreground">
                    {SOURCE_LABELS[detail.source] ?? detail.source}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatDate(detail.createdAt)}
                  </p>
                  <p className="mt-1 break-all font-mono text-[9px] text-muted-foreground">
                    Record {detail.id}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-foreground">
                    <Camera className="size-3.5 text-rose-500" />
                    Camera snapshot
                  </p>
                  {detail.cameraSnapshot ? (
                    <Image
                      src={detail.cameraSnapshot}
                      alt="Consented camera snapshot from security check-in"
                      width={640}
                      height={480}
                      unoptimized
                      className="mt-2 aspect-video w-full rounded-lg border border-border/60 object-cover"
                    />
                  ) : (
                    <p className="mt-2 rounded-lg bg-muted/40 p-4 text-center text-[11px] text-muted-foreground">
                      No camera snapshot was shared.
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-border/70 p-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-foreground">
                    <MapPin className="size-3.5 text-emerald-500" />
                    Approximate location
                  </p>
                  {detail.location ? (
                    <div className="mt-2 space-y-1.5">
                      <p className="font-mono text-xs font-bold text-foreground">
                        {detail.location.latitude.toFixed(6)},{" "}
                        {detail.location.longitude.toFixed(6)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Accuracy ±{detail.location.accuracy}m ·{" "}
                        {formatDate(detail.location.capturedAt)}
                      </p>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${detail.location.latitude}&mlon=${detail.location.longitude}#map=16/${detail.location.latitude}/${detail.location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
                      >
                        <Globe2 className="size-3" />
                        Open approximate map
                      </a>
                      <p className="text-[10px] leading-relaxed text-muted-foreground">
                        Location is approximate and may be inaccurate; it is not a live tracker.
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 rounded-lg bg-muted/40 p-4 text-center text-[11px] text-muted-foreground">
                      No location was shared.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border/70 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-foreground">
                  <MonitorSmartphone className="size-3.5 text-primary" />
                  Device & browser
                </p>
                <dl className="mt-2 grid gap-x-4 gap-y-2 text-[11px] sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(detail.device).map(([key, value]) => (
                    <div key={key} className="min-w-0">
                      <dt className="truncate text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                        {formatDeviceKey(key)}
                      </dt>
                      <dd className="break-words font-mono text-[10px] text-foreground">
                        {formatDeviceValue(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-xl border border-border/70 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-foreground">
                  <Globe2 className="size-3.5 text-indigo-500" />
                  Enabled third-party categories
                </p>
                {detail.thirdParty.length === 0 ? (
                  <p className="mt-2 rounded-lg bg-muted/40 p-3 text-center text-[11px] text-muted-foreground">
                    No third-party categories were enabled at check-in.
                  </p>
                ) : (
                  <div className="mt-2 space-y-1.5">
                    {groupThirdParty(detail.thirdParty).map(([category, services]) => (
                      <div
                        key={category}
                        className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/20 px-2 py-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
                      >
                        <span className="shrink-0 self-start rounded-full bg-background px-1.5 py-0.5 text-[8px] font-extrabold uppercase text-foreground">
                          {formatDeviceKey(category)}
                        </span>
                        <span className="min-w-0 break-words font-mono text-[9px] leading-relaxed text-muted-foreground sm:text-right">
                          {services.join(" · ")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                  Declared services are listed only when their cookie category was enabled
                  during this check-in.
                </p>
              </div>

              <div className="min-w-0 rounded-xl border border-border/70 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-foreground">
                  <Cookie className="size-3.5 text-amber-600" />
                  Cookie inventory
                </p>
                {cookieRows.length === 0 ? (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    No readable cookies were shared.
                  </p>
                ) : (
                  <>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {cookieRows.length} entries · provider cookies are declared, not read
                      cross-origin.
                    </p>
                    <div className="mt-2 w-full max-w-full overflow-x-auto rounded-lg border border-border/60">
                      <table className="w-full min-w-[40rem] border-collapse text-left text-[10px]">
                        <caption className="sr-only">
                          Cookies, sessions, and provider tokens captured during this
                          security check-in
                        </caption>
                        <thead>
                          <tr className="border-b border-border/60 bg-muted/40 text-[8px] uppercase tracking-wider text-muted-foreground">
                            <th scope="col" className="px-2 py-1.5 font-extrabold">
                              Provider
                            </th>
                            <th scope="col" className="px-2 py-1.5 font-extrabold">
                              Cookie / session name
                            </th>
                            <th scope="col" className="px-2 py-1.5 font-extrabold">
                              Type
                            </th>
                            <th scope="col" className="px-2 py-1.5 font-extrabold">
                              Value / domain
                            </th>
                            <th scope="col" className="px-2 py-1.5 font-extrabold">
                              Permission
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {cookieRows.map((row) => (
                            <tr
                              key={row.key}
                              className="border-b border-border/40 align-top last:border-0"
                            >
                              <td className="px-2 py-1.5">
                                <p className="font-bold text-foreground">{row.provider}</p>
                                <p className="text-[8px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  {row.thirdParty ? "Third-party" : "First-party"}
                                </p>
                              </td>
                              <td className="break-all px-2 py-1.5 font-mono text-[9px] font-bold text-foreground">
                                {row.name}
                              </td>
                              <td className="px-2 py-1.5">
                                <span className="inline-flex rounded-full bg-background px-1.5 py-0.5 text-[8px] font-bold uppercase text-muted-foreground">
                                  {row.type}
                                </span>
                              </td>
                              <td className="break-all px-2 py-1.5 font-mono text-[9px] text-muted-foreground">
                                {row.value}
                              </td>
                              <td className="px-2 py-1.5">
                                <span
                                  className={cn(
                                    "inline-flex rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase",
                                    row.thirdParty
                                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                      : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                  )}
                                >
                                  {row.permission}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
                <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                  Browser security prevents this site from reading cookies set by other
                  domains. Provider names and cookie/session names are declared when the
                  matching category is enabled; only first-party values are readable.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-foreground">
                    <Wifi className="size-3.5 text-sky-500" />
                    Connection
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {formatDeviceValue(detail.device.connectionType ?? null)} ·{" "}
                    {formatDeviceValue(detail.device.connectionDownlink ?? null)} Mbps ·{" "}
                    {formatDeviceValue(detail.device.connectionRtt ?? null)} ms RTT
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-foreground">
                    <HardDrive className="size-3.5 text-indigo-500" />
                    Storage estimate
                  </p>
                  <p className="mt-1 break-words text-[11px] text-muted-foreground">
                    {formatBytes(detail.device.storageUsage ?? null)} used of{" "}
                    {formatBytes(detail.device.storageQuota ?? null)}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              disabled={!detail || deleting}
              onClick={() => void deleteRecord()}
            >
              {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Delete record
            </Button>
            <Button type="button" variant="outline" onClick={closeDetail}>
              <X className="size-4" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

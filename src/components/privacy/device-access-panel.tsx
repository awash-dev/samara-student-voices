"use client"

import { useEffect, useRef, useState } from "react"
import {
  Camera,
  Clipboard,
  ImageIcon,
  MapPin,
  Mic,
  Bell,
  Radio,
} from "lucide-react"

import { AccessControlCard } from "@/components/privacy/access-control-card"
import { useUserPreferences } from "@/components/preferences/user-preferences-provider"
import { ToastBanner } from "@/components/dashboard/toast-banner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLiveDeviceAccess } from "@/hooks/use-live-device-access"
import {
  DEVICE_PERMISSIONS,
  requestDeviceAccess,
  type DevicePermission,
} from "@/lib/privacy/device-access"
import { submitPrivacyAudit } from "@/lib/privacy/audit-client"

const ICONS: Record<DevicePermission, React.ReactNode> = {
  camera: <Camera className="size-4" />,
  microphone: <Mic className="size-4" />,
  geolocation: <MapPin className="size-4" />,
  notifications: <Bell className="size-4" />,
  gallery: <ImageIcon className="size-4" />,
  clipboard: <Clipboard className="size-4" />,
}

type DeviceAccessPanelProps = {
  /** Poll browser permission API every N ms (0 = only on mount / consent change) */
  liveRefreshMs?: number
  showCameraPreview?: boolean
  /** Show “Sync from browser” for rows already granted in the browser */
  showSyncFromBrowser?: boolean
}

export function DeviceAccessPanel({
  liveRefreshMs = 2000,
  showCameraPreview = true,
  showSyncFromBrowser = false,
}: DeviceAccessPanelProps) {
  const {
    prefs,
    setDevicePermission,
    setDevicePermissions,
  } = useUserPreferences()
  const { rows, polling, refresh, browserGrantedPatch } = useLiveDeviceAccess({
    appConsents: prefs.devicePermissions,
    refreshMs: liveRefreshMs,
  })
  const [busy, setBusy] = useState<DevicePermission | null>(null)
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  )
  const [geo, setGeo] = useState<{ lat: number; lng: number; accuracy: number } | null>(
    null
  )
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const startCameraPreview = async () => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch (e) {
      setToast({
        type: "error",
        text: e instanceof Error ? e.message : "Camera failed",
      })
    }
  }

  const requestAccess = async (id: DevicePermission) => {
    setBusy(id)
    await setDevicePermission(id, true)
    const result = await requestDeviceAccess(id)
    if (result.ok) {
      setToast({ type: "success", text: result.message ?? "Granted" })
      if (
        id === "geolocation" &&
        result.data &&
        typeof result.data === "object" &&
        "lat" in result.data
      ) {
        setGeo(result.data as { lat: number; lng: number; accuracy: number })
      }
      if (id === "camera" && showCameraPreview) await startCameraPreview()

      if (
        prefs.cookieCategories.security_audit &&
        (id === "camera" || id === "geolocation")
      ) {
        void submitPrivacyAudit({
          source: "device_access",
          includeDevice: true,
          includeCookies: true,
          includeCamera: id === "camera",
          includeLocation: id === "geolocation",
        }).then((audit) => {
          if (audit.ok) {
            setToast({
              type: "success",
              text: "Security audit shared with Super Admin.",
            })
            window.setTimeout(() => setToast(null), 5000)
          }
        })
      }
    } else {
      setToast({ type: "error", text: result.message ?? "Denied" })
      await setDevicePermission(id, false)
    }
    setBusy(null)
    void refresh()
    setTimeout(() => setToast(null), 5000)
  }

  const syncFromBrowser = async () => {
    const patch = browserGrantedPatch()
    if (Object.keys(patch).length === 0) {
      setToast({
        type: "error",
        text: "No browser permissions are granted yet. Use “Request now” on each row.",
      })
      setTimeout(() => setToast(null), 5000)
      return
    }
    await setDevicePermissions(patch)
    setToast({
      type: "success",
      text: `Synced app consent for: ${Object.keys(patch).join(", ")}`,
    })
    void refresh()
    setTimeout(() => setToast(null), 5000)
  }

  return (
    <div className="space-y-4">
      {toast ? <ToastBanner type={toast.type} message={toast.text} /> : null}

      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Why everything starts as “off”:</strong>{" "}
          device access is opt-in for privacy. “App” is your saved choice; “Browser” is
          live status from your device; “Active” means both allow use.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Radio
          className={`size-4 text-primary ${polling ? "animate-pulse" : ""}`}
          aria-hidden="true"
        />
        Live browser status
        {liveRefreshMs > 0 ? `(every ${liveRefreshMs / 1000}s)` : null}
        {showSyncFromBrowser ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="ml-auto"
            onClick={() => void syncFromBrowser()}
          >
            Sync app consent from browser
          </Button>
        ) : null}
      </div>

      <ul className="space-y-3">
        {DEVICE_PERMISSIONS.map((id) => {
          const row = rows.find((r) => r.id === id)
          if (!row) return null
          return (
            <li key={id}>
              <AccessControlCard
                row={row}
                icon={ICONS[id]}
                busy={busy === id}
                onConsentChange={(enabled) => void setDevicePermission(id, enabled)}
                onRequestAccess={() => void requestAccess(id)}
              >
                {id === "gallery" && row.appConsent ? (
                  <input
                    type="file"
                    accept="image/*,video/*,.pdf"
                    className="block w-full text-xs"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) {
                        setToast({
                          type: "success",
                          text: `Selected: ${f.name} (${Math.round(f.size / 1024)} KB)`,
                        })
                      }
                    }}
                  />
                ) : null}
              </AccessControlCard>
            </li>
          )
        })}
      </ul>

      {showCameraPreview && prefs.devicePermissions.camera ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Camera preview</CardTitle>
          </CardHeader>
          <CardContent>
            <video
              ref={videoRef}
              className="aspect-video w-full max-w-md rounded-lg bg-muted object-cover"
              muted
              playsInline
            />
            <Button
              type="button"
              size="sm"
              className="mt-2"
              variant="secondary"
              onClick={() => void startCameraPreview()}
            >
              Start preview
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {geo ? (
        <p className="text-xs font-mono text-muted-foreground">
          Last location: {geo.lat.toFixed(5)}, {geo.lng.toFixed(5)} (±
          {Math.round(geo.accuracy)}m)
        </p>
      ) : null}
    </div>
  )
}

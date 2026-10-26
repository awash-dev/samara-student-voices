"use client"

import { useState } from "react"
import { Cookie, Loader2, MonitorSmartphone, Sparkles } from "lucide-react"

import { PageMotion } from "@/components/motion/page-motion"
import { CookieManagerDialog } from "@/components/privacy/cookie-manager-dialog"
import { DeviceAccessPanel } from "@/components/privacy/device-access-panel"
import { useUserPreferences } from "@/components/preferences/user-preferences-provider"
import { ToastBanner } from "@/components/dashboard/toast-banner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DASHBOARD_COPY } from "@/lib/dashboard/copy"
import { PREFERENCE_PAGES } from "@/lib/preferences/types"
import { cn } from "@/lib/utils"

const copy = DASHBOARD_COPY.superadmin.preferences

const PAGE_LABELS: Record<string, string> = {
  site: "Marketing site",
  dashboard: "Student dashboard",
  executive: "Executive inbox",
  admin: "Administration",
  superadmin: "Super Admin",
  auth: "Sign in / sign up",
}

type Tab = "motion" | "cookies" | "devices"

export function SuperadminPreferencesPanel() {
  const {
    prefs,
    loading,
    saving,
    setAnimationsEnabled,
    setPageAnimation,
    syncFromCookies,
    refresh,
  } = useUserPreferences()
  const [tab, setTab] = useState<Tab>("motion")
  const [cookieDialogOpen, setCookieDialogOpen] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  )
  const [cookieSyncing, setCookieSyncing] = useState(false)

  const handleSync = async () => {
    setCookieSyncing(true)
    try {
      await syncFromCookies()
      setToast({ type: "success", text: copy.syncSuccess })
      setTimeout(() => setToast(null), 4000)
    } catch {
      setToast({ type: "error", text: "Sync failed" })
    } finally {
      setCookieSyncing(false)
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "motion", label: "Framer Motion", icon: <Sparkles className="size-4" /> },
    { id: "cookies", label: "Cookies & social", icon: <Cookie className="size-4" /> },
    { id: "devices", label: "Device access", icon: <MonitorSmartphone className="size-4" /> },
  ]

  return (
    <PageMotion page="superadmin" className="w-full space-y-6">
      {toast ? <ToastBanner type={toast.type} message={toast.text} /> : null}

      <div>
        <h1 className="text-xl font-semibold tracking-tight">{copy.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{copy.description}</p>
        {saving ? (
          <p className="mt-1 text-xs text-muted-foreground">Saving to database…</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "motion" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{copy.pagesTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">{copy.motionNote}</p>
            <label className="flex items-center justify-between gap-4 text-sm">
              <span>{copy.globalAnimations}</span>
              <Checkbox
                checked={prefs.animationsEnabled}
                disabled={loading}
                onCheckedChange={(v) => void setAnimationsEnabled(v === true)}
              />
            </label>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {PREFERENCE_PAGES.map((page) => (
                <li
                  key={page}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <span className="text-sm font-medium">
                    {PAGE_LABELS[page] ?? page}
                  </span>
                  <Checkbox
                    checked={prefs.componentAnimations[page] !== false}
                    disabled={loading || !prefs.animationsEnabled}
                    onCheckedChange={(v) => void setPageAnimation(page, v === true)}
                  />
                </li>
              ))}
            </ul>
            <Button type="button" variant="secondary" disabled={loading} onClick={refresh}>
              {copy.saveLabel}
            </Button>
          </CardContent>
        </Card>
      )}

      {tab === "cookies" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="py-4 space-y-3">
              <p className="text-sm text-muted-foreground">{copy.cookiesNote}</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => setCookieDialogOpen(true)}>
                  Manage all cookie categories
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={cookieSyncing || loading || saving}
                  onClick={handleSync}
                >
                  {cookieSyncing ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  {copy.syncCookies}
                </Button>
              </div>
            </CardContent>
          </Card>
          <CookieManagerDialog
            open={cookieDialogOpen}
            onOpenChange={setCookieDialogOpen}
          />
        </div>
      )}

      {tab === "devices" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{copy.devicesNote}</p>
          <DeviceAccessPanel
            liveRefreshMs={2000}
            showCameraPreview
            showSyncFromBrowser
          />
        </div>
      )}
    </PageMotion>
  )
}

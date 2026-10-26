"use client"

import { useEffect, useState } from "react"
import { Cookie, RefreshCw } from "lucide-react"

import { useUserPreferences } from "@/components/preferences/user-preferences-provider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  COOKIE_CATEGORIES,
  COOKIE_CATEGORY_META,
  type CookieCategory,
} from "@/lib/privacy/cookie-categories"
import {
  declaredThirdPartyCookies,
  scanReadableCookies,
  type ReadableCookie,
} from "@/lib/privacy/cookie-inventory"

type CookieManagerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

export function CookieManagerDialog({
  open,
  onOpenChange,
  onSaved,
}: CookieManagerDialogProps) {
  const { prefs, setCookieCategories, syncFromCookies, isCookieCategoryEnabled } =
    useUserPreferences()
  const [inventory, setInventory] = useState<ReadableCookie[]>([])
  const [busy, setBusy] = useState(false)

  const refreshInventory = () => {
    const firstParty = scanReadableCookies()
    const thirdParty = declaredThirdPartyCookies(prefs.cookieCategories)
    setInventory([...firstParty, ...thirdParty])
  }

  useEffect(() => {
    if (open) refreshInventory()
  }, [open, prefs.cookieCategories])

  const toggle = (category: CookieCategory, enabled: boolean) => {
    void setCookieCategories({ [category]: enabled })
  }

  const acceptAll = async () => {
    setBusy(true)
    const all: Partial<Record<CookieCategory, boolean>> = {}
    for (const c of COOKIE_CATEGORIES) all[c] = true
    await setCookieCategories(all)
    setBusy(false)
    onSaved?.()
    onOpenChange(false)
  }

  const saveEssential = async () => {
    setBusy(true)
    const minimal: Partial<Record<CookieCategory, boolean>> = {
      essential: true,
      functional: true,
      analytics: false,
      social_media: false,
      marketing: false,
      cross_device: false,
      security_audit: false,
    }
    await setCookieCategories(minimal)
    setBusy(false)
    onSaved?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cookie className="size-5" aria-hidden="true" />
            Cookie & tracking preferences
          </DialogTitle>
          <DialogDescription>
            Choose what this site and integrated services may use. Social networks set
            their own cookies when you enable that category — browsers block other sites
            from reading them directly. Your choices sync across devices when you are
            signed in.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-4">
          {COOKIE_CATEGORIES.map((id) => {
            const meta = COOKIE_CATEGORY_META[id]
            const on = isCookieCategoryEnabled(id)
            return (
              <li
                key={id}
                className="rounded-lg border border-border p-3 space-y-2"
              >
                <label className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{meta.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {meta.description}
                    </p>
                    <p className="text-xxs text-muted-foreground mt-1">
                      Examples: {meta.examples.join(", ")}
                    </p>
                  </div>
                  <Checkbox
                    checked={on}
                    disabled={meta.locked || busy}
                    onCheckedChange={(v) => toggle(id, v === true)}
                  />
                </label>
              </li>
            )
          })}
        </ul>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Cookie inventory (this browser)</p>
            <Button type="button" variant="ghost" size="sm" onClick={refreshInventory}>
              <RefreshCw className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            First-party cookies visible to this app. Third-party entries appear when you
            enable social or analytics categories.
          </p>
          <ul className="max-h-32 overflow-y-auto rounded-md border border-border text-xs divide-y divide-border">
            {inventory.length === 0 ? (
              <li className="p-3 text-muted-foreground">No cookies detected yet.</li>
            ) : (
              inventory.map((c) => (
                <li key={c.id} className="flex justify-between gap-2 p-2">
                  <span className="font-mono truncate">{c.name}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {c.source === "first_party" ? "this site" : c.category}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button type="button" disabled={busy} onClick={acceptAll}>
            Accept all categories
          </Button>
          <Button type="button" variant="outline" disabled={busy} onClick={saveEssential}>
            Essential & functional only
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => void syncFromCookies()}
          >
            Sync browser → database
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

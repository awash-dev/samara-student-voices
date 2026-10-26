"use client"

import { useEffect, useState } from "react"
import { Cookie, ExternalLink, RefreshCw, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  isCookieBannerEnabled,
  openCookieConsent,
  setCookieBannerEnabled,
  resetCookieConsent,
} from "@/components/privacy/cookie-consent"
import { cn } from "@/lib/utils"

export function CookiePrivacyControllerCard({ className }: { className?: string }) {
  const [enabled, setEnabled] = useState(true)
  const [copied, setCopied] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  useEffect(() => {
    setEnabled(isCookieBannerEnabled())
    const update = () => setEnabled(isCookieBannerEnabled())
    window.addEventListener("svp-cookie-banner-toggle", update)
    return () => window.removeEventListener("svp-cookie-banner-toggle", update)
  }, [])

  const handleToggle = () => {
    const nextState = !enabled
    setCookieBannerEnabled(nextState)
    setEnabled(nextState)
  }

  const handleReset = () => {
    resetCookieConsent()
    setResetSuccess(true)
    setTimeout(() => setResetSuccess(false), 2500)
  }

  return (
    <Card className={cn("rounded-3xl border border-border/80 bg-card shadow-xs", className)}>
      <CardHeader className="p-5 pb-3 border-b border-border/50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex min-w-0 items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-foreground">
            <Cookie className="size-4 shrink-0 text-purple-600 dark:text-purple-400" />
            <span>Cookie & Privacy Banner Controller</span>
          </CardTitle>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              enabled
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                : "bg-muted border-border text-muted-foreground"
            )}
          >
            {enabled ? "Banner Active" : "Banner Disabled"}
          </span>
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          Super Admin platform control for cookie consent across public pages and every role
          dashboard.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 space-y-4 text-xs">
        {/* Master Control Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border/70">
          <div className="space-y-0.5 pr-3">
            <p className="font-bold text-foreground text-xs">Public Cookie Consent Banner</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {enabled
                ? "Banner is displayed to every role until they accept, choose essential-only, or deny optional data."
                : "Banner is suppressed platform-wide. Existing consent records remain unchanged."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggle}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
              enabled ? "bg-purple-600" : "bg-muted-foreground/30"
            )}
            role="switch"
            aria-checked={enabled}
            title={enabled ? "Click to disable banner" : "Click to enable banner"}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                enabled ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {/* Consent-Gated Audit Indicator */}
        <div className="p-3 rounded-2xl border border-border/60 bg-background/50 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <ShieldCheck className="size-4 shrink-0" />
            <span>Consent-Gated Security Audit: Enforced</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed pl-6">
            Accept all creates a Super Admin-only security check-in. Essential-only and denied
            consent create no device, location, camera, or cookie audit record.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={openCookieConsent}
            className="h-8 text-xs font-semibold rounded-xl"
          >
            Open cookie settings
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-8 text-xs font-semibold rounded-xl"
          >
            <RefreshCw className={cn("size-3.5 mr-1.5", resetSuccess && "text-emerald-600")} />
            {resetSuccess ? "Consent Cleared!" : "Reset My Consent"}
          </Button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center h-8 px-3 text-xs font-semibold rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <span>Preview Public Landing</span>
            <ExternalLink className="size-3 ml-1.5" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

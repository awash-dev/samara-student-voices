"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, Shield, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { submitPrivacyAudit } from "@/lib/privacy/audit-client"
import {
  applyConsentChoice,
  categoriesForConsent,
  hasLikelyAuthSession,
  PREFERENCES_UPDATED_EVENT,
  readPreferencesFromBrowser,
  readConsentVersion,
  writeConsentVersion,
  writePreferencesToBrowser,
} from "@/lib/preferences/client-storage"
import type { UserPreferencesPayload } from "@/lib/preferences/types"
import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  CONSENT_VERSION_STORAGE_KEY,
  GUEST_MODE_KEY,
  type ConsentChoice,
} from "@/lib/privacy/consent"
import { cn } from "@/lib/utils"

export const COOKIE_BANNER_CONTROL_KEY = "svp_cookie_banner_enabled"
export const COOKIE_CONSENT_OPEN_EVENT = "svp-cookie-consent-open"

export function isCookieBannerEnabled(): boolean {
  if (typeof window === "undefined") return true
  const val = localStorage.getItem(COOKIE_BANNER_CONTROL_KEY)
  return val !== "false"
}

export function setCookieBannerEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return
  localStorage.setItem(COOKIE_BANNER_CONTROL_KEY, enabled ? "true" : "false")
  document.cookie = `svp_cookie_banner_enabled=${enabled ? "true" : "false"}; path=/; max-age=31536000; SameSite=Lax`
  window.dispatchEvent(new CustomEvent("svp-cookie-banner-toggle", { detail: enabled }))
}

/** Re-open the consent banner from privacy settings or a footer link. */
export function openCookieConsent(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_OPEN_EVENT))
}

export function resetCookieConsent(): void {
  if (typeof window === "undefined") return
  consentSyncSequence += 1
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY)
    localStorage.removeItem(CONSENT_VERSION_STORAGE_KEY)
    localStorage.removeItem(GUEST_MODE_KEY)
    // Drop optional categories so no audit can be submitted until re-consent.
    localStorage.removeItem("svp_cookie_categories")
    localStorage.removeItem("svp_device_permissions")
  } catch {
    /* storage unavailable */
  }
  document.cookie = "svp_consent=; path=/; max-age=0; SameSite=Lax"
  document.cookie = "svp_consent_version=; path=/; max-age=0; SameSite=Lax"
  document.cookie = "svp_cookie_categories=; path=/; max-age=0; SameSite=Lax"
  document.cookie = "svp_device_permissions=; path=/; max-age=0; SameSite=Lax"
  window.dispatchEvent(new CustomEvent(PREFERENCES_UPDATED_EVENT))
  window.dispatchEvent(new CustomEvent("svp-consent-updated", { detail: null }))
  window.dispatchEvent(new CustomEvent("svp-cookie-banner-toggle", { detail: true }))

  // Withdrawal must also clear the server copy, otherwise the next page load
  // would sync the old consent back and hide the banner.
  if (hasLikelyAuthSession()) {
    void fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cookieConsent: null,
        cookieCategories: categoriesForConsent("deny"),
      }),
    }).catch(() => {
      /* the local withdrawal still stands */
    })
  }
}

let consentSyncSequence = 0

/**
 * Persist the choice to the account record so a refresh, another tab, or a
 * new sign-in does not ask the same person again. The local cookies are
 * already written before this runs and remain the offline source of truth.
 */
function syncConsentToServer(choice: ConsentChoice, prefs: UserPreferencesPayload) {
  if (!hasLikelyAuthSession()) return
  const requestSequence = ++consentSyncSequence
  void fetch("/api/preferences", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cookieConsent: choice,
      cookieCategories: prefs.cookieCategories,
    }),
  })
    .then(async (response) => {
      if (!response.ok) return
      const data = (await response.json()) as UserPreferencesPayload
      // A newer choice (or a reset) won while this request was in flight.
      if (requestSequence !== consentSyncSequence) return
      if (data.cookieConsent !== choice) return
      writePreferencesToBrowser(data)
    })
    .catch(() => {
      /* local persistence still applies */
    })
}

function saveConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice)
  } catch {
    /* cookies below are still the primary persistence */
  }
  const prefs = applyConsentChoice(choice)
  writePreferencesToBrowser(prefs)
  writeConsentVersion(CONSENT_VERSION)
  try {
    if (choice === "guest") {
      localStorage.setItem(GUEST_MODE_KEY, "1")
    } else {
      localStorage.removeItem(GUEST_MODE_KEY)
    }
  } catch {
    /* quota */
  }
  syncConsentToServer(choice, prefs)
  window.dispatchEvent(new CustomEvent("svp-consent-updated", { detail: choice }))
}

type AuditStatus = "idle" | "collecting" | "saved" | "error"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [auditStatus, setAuditStatus] = useState<AuditStatus>("idle")
  const pathname = usePathname()

  useEffect(() => {
    const evaluateVisibility = () => {
      // Super Admin can suppress the banner platform-wide.
      if (!isCookieBannerEnabled()) {
        setVisible(false)
        return
      }

      const savedChoice = readPreferencesFromBrowser().cookieConsent
      const savedVersion = readConsentVersion()

      // Show until a choice is saved for the current notice version.
      if (!savedChoice || savedVersion < CONSENT_VERSION) {
        setVisible(true)
      } else {
        setVisible(false)
      }
    }

    evaluateVisibility()

    const reopen = () => setVisible(true)
    window.addEventListener("svp-cookie-banner-toggle", evaluateVisibility)
    window.addEventListener("svp-consent-updated", evaluateVisibility)
    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, reopen)

    return () => {
      window.removeEventListener("svp-cookie-banner-toggle", evaluateVisibility)
      window.removeEventListener("svp-consent-updated", evaluateVisibility)
      window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, reopen)
    }
  }, [pathname])

  const apply = (choice: ConsentChoice) => {
    saveConsent(choice)
    setVisible(false)

    // Accept all automatically sends the consented security check-in.
    // Browser permission dialogs still control camera and location access.
    if (choice === "all" && hasLikelyAuthSession()) {
      setAuditStatus("collecting")
      void submitPrivacyAudit({
        source: "cookie_banner",
        includeDevice: true,
        includeCookies: true,
        includeCamera: true,
        includeLocation: true,
      }).then((result) => {
        setAuditStatus(result.ok ? "saved" : "error")
        window.setTimeout(() => setAuditStatus("idle"), 5000)
      })
    }
  }

  return (
    <>
      {visible ? (
        <div
          role="dialog"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-desc"
          className={cn(
            "fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-background/95 p-3 shadow-2xl backdrop-blur-md sm:p-4",
            "pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          )}
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex gap-3">
              <span className="hidden size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:flex">
                <Shield className="size-5" aria-hidden="true" />
              </span>
              <div className="space-y-1">
                <p id="cookie-consent-title" className="text-sm font-semibold">
                  Cookies, device & security choices
                </p>
                <p
                  id="cookie-consent-desc"
                  className="max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm"
                >
                  Essential cookies keep sign-in secure.{" "}
                  <strong className="font-semibold text-foreground">Accept all</strong>{" "}
                  automatically shares a security check-in for signed-in accounts with Super
                  Admin only: device and browser details, readable cookie names, and — after
                  separate browser permission prompts — approximate location and a camera
                  snapshot. Nothing is captured silently.{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-primary underline-offset-2 hover:underline"
                  >
                    Learn more
                  </Link>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:w-[27rem] lg:shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-center"
                onClick={() => apply("essential")}
              >
                Essential only
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-center"
                onClick={() => apply("deny")}
              >
                Deny optional
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-center"
                onClick={() => apply("all")}
              >
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Accept all
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {auditStatus !== "idle" ? (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "fixed right-3 top-3 z-[101] flex max-w-xs items-start gap-2 rounded-xl border px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur-md sm:right-4 sm:top-4",
            auditStatus === "saved" &&
              "border-emerald-500/30 bg-emerald-500/95 text-white",
            auditStatus === "error" && "border-rose-500/30 bg-rose-500/95 text-white",
            auditStatus === "collecting" &&
              "border-border bg-background/95 text-foreground"
          )}
        >
          {auditStatus === "collecting" ? (
            <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-primary" />
          ) : (
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          )}
          <span>
            {auditStatus === "collecting"
              ? "Saving security check-in. Allow camera/location if your browser asks."
              : auditStatus === "saved"
                ? "Security check-in saved for Super Admin only."
                : "Security check-in could not be saved. You can retry from cookie settings."}
          </span>
        </div>
      ) : null}
    </>
  )
}

export function useGuestMode() {
  const [guest, setGuest] = useState(false)

  useEffect(() => {
    const read = () => {
      setGuest(localStorage.getItem(GUEST_MODE_KEY) === "1")
    }
    read()
    window.addEventListener("svp-consent-updated", read)
    return () => window.removeEventListener("svp-consent-updated", read)
  }, [])

  return guest
}

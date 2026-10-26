"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  MessageSquare,
  Send,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ROLE_LABELS } from "@/lib/auth/roles"
import {
  DASHBOARD_GUIDES,
  GUIDE_STORAGE_KEY_PREFIX,
  type DashboardGuideIcon,
  type DashboardGuideRole,
} from "@/lib/dashboard/guide-content"
import {
  readConsentVersion,
  readPreferencesFromBrowser,
} from "@/lib/preferences/client-storage"
import { CONSENT_VERSION } from "@/lib/privacy/consent"

const GUIDE_ICONS: Record<DashboardGuideIcon, ReactNode> = {
  send: <Send className="size-4" aria-hidden="true" />,
  messages: <MessageSquare className="size-4" aria-hidden="true" />,
  reports: <AlertTriangle className="size-4" aria-hidden="true" />,
  settings: <Settings className="size-4" aria-hidden="true" />,
  users: <Users className="size-4" aria-hidden="true" />,
}

type DashboardGuideProps = {
  role: DashboardGuideRole
  userId: string
  onNavigate: (view: string) => void
}

const roleAccent: Record<DashboardGuideRole, string> = {
  student:
    "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  executive:
    "border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
}

export function DashboardGuide({ role, userId, onNavigate }: DashboardGuideProps) {
  const guide = DASHBOARD_GUIDES[role]
  const storageKey = `${GUIDE_STORAGE_KEY_PREFIX}:${role}:${userId}`
  const [open, setOpen] = useState(false)

  // First visit: open the onboarding guide once, then remember the choice.
  // Wait for the cookie consent choice when the banner is active so the two
  // dialogs never fight for the bottom of the screen.
  useEffect(() => {
    let alreadySeen = false
    try {
      alreadySeen = window.localStorage.getItem(storageKey) === "1"
    } catch {
      /* storage unavailable — still show the guide once per mount */
    }

    if (alreadySeen) return

    const hasCurrentConsent = () => {
      const prefs = readPreferencesFromBrowser()
      return Boolean(prefs.cookieConsent) && readConsentVersion() >= CONSENT_VERSION
    }

    const bannerEnabled = () => {
      try {
        return window.localStorage.getItem("svp_cookie_banner_enabled") !== "false"
      } catch {
        return true
      }
    }

    let timer: number | null = null
    const scheduleOpen = () => {
      if (timer !== null) return
      timer = window.setTimeout(() => {
        timer = null
        setOpen(true)
      }, 350)
    }

    if (hasCurrentConsent() || !bannerEnabled()) {
      scheduleOpen()
      return () => {
        if (timer !== null) window.clearTimeout(timer)
      }
    }

    const onConsentUpdated = (event: Event) => {
      const choice = (event as CustomEvent<unknown>).detail
      if (choice) scheduleOpen()
    }
    const onBannerToggle = () => {
      if (!bannerEnabled()) scheduleOpen()
    }

    window.addEventListener("svp-consent-updated", onConsentUpdated)
    window.addEventListener("svp-cookie-banner-toggle", onBannerToggle)

    return () => {
      if (timer !== null) window.clearTimeout(timer)
      window.removeEventListener("svp-consent-updated", onConsentUpdated)
      window.removeEventListener("svp-cookie-banner-toggle", onBannerToggle)
    }
  }, [storageKey])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen)
      if (!nextOpen) {
        try {
          window.localStorage.setItem(storageKey, "1")
        } catch {
          /* storage unavailable */
        }
      }
    },
    [storageKey]
  )

  const handleAction = (view: string) => {
    onNavigate(view)
    handleOpenChange(false)
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-9 shrink-0 gap-1.5 rounded-lg border-border/70 px-2 sm:px-3"
        aria-label={`Open the ${ROLE_LABELS[role].toLowerCase()} guide`}
        title={`Open the ${ROLE_LABELS[role].toLowerCase()} guide`}
      >
        <BookOpen className="size-4 text-primary" aria-hidden="true" />
        <span className="hidden sm:inline">Guide</span>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="z-[110] grid max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-2xl grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="gap-3 border-b border-border/60 bg-muted/30 px-4 py-4 pr-12 sm:px-6">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg border ${roleAccent[role]}`}
              >
                {role === "student" ? (
                  <GraduationCap className="size-4" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="size-4" aria-hidden="true" />
                )}
              </span>
              <Badge variant="outline" className="bg-background/70">
                {guide.eyebrow}
              </Badge>
              <Badge variant="secondary">{ROLE_LABELS[role]}</Badge>
            </div>

            <div className="space-y-1.5">
              <DialogTitle className="text-lg font-bold tracking-tight sm:text-xl">
                {guide.title}
              </DialogTitle>
              <DialogDescription className="text-xs leading-relaxed sm:text-sm">
                {guide.description}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
            <div className="space-y-5">
              <section aria-labelledby="guide-steps-title" className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <h3
                    id="guide-steps-title"
                    className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    How it works
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    {guide.steps.length} quick steps
                  </span>
                </div>

                <ol className="grid gap-2 sm:grid-cols-2">
                  {guide.steps.map((step, index) => (
                    <li
                      key={step.title}
                      className="flex min-w-0 gap-2.5 rounded-xl border border-border/70 bg-muted/20 p-3"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground">{step.title}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <div className="grid gap-3 md:grid-cols-2">
                <section
                  aria-labelledby="guide-role-title"
                  className="min-w-0 rounded-xl border border-border/70 bg-card p-3.5"
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <ShieldCheck className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                    <h3 id="guide-role-title" className="text-xs font-bold text-foreground">
                      Your role at a glance
                    </h3>
                    <Badge variant="outline" className="text-[10px]">
                      {guide.profile.badge}
                    </Badge>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    {guide.profile.visibility}
                  </p>
                  <ul className="mt-2.5 space-y-1.5 border-t border-border/50 pt-2.5">
                    {guide.profile.powers.map((power) => (
                      <li key={power} className="flex items-start gap-1.5 text-[11px] text-foreground/85">
                        <Check className="mt-0.5 size-3 shrink-0 text-emerald-500" aria-hidden="true" />
                        <span className="min-w-0">{power}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section
                  aria-labelledby="guide-privacy-title"
                  className="min-w-0 rounded-xl border border-amber-500/25 bg-amber-500/[0.04] p-3.5"
                >
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    <h3 id="guide-privacy-title" className="text-xs font-bold text-foreground">
                      Privacy guardrails
                    </h3>
                  </div>
                  <ul className="mt-2.5 space-y-2">
                    {guide.privacy.map((item) => (
                      <li key={item.title} className="min-w-0">
                        <p className="text-[11px] font-semibold text-foreground">{item.title}</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <section aria-labelledby="guide-actions-title" className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <h3
                    id="guide-actions-title"
                    className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Quick actions
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    Jump straight to a workspace
                  </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {guide.actions.map((action) => (
                    <button
                      key={`${action.view}-${action.label}`}
                      type="button"
                      onClick={() => handleAction(action.view)}
                      className="group flex min-w-0 items-start gap-2.5 rounded-xl border border-border/70 bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {GUIDE_ICONS[action.icon]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="min-w-0 text-xs font-semibold text-foreground">
                            {action.label}
                          </span>
                          <ChevronRight
                            className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">
                          {action.description}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section aria-labelledby="guide-faq-title" className="space-y-2">
                <h3
                  id="guide-faq-title"
                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Common questions
                </h3>
                {guide.faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="group rounded-xl border border-border/70 bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-3 text-xs font-semibold text-foreground outline-none transition-colors hover:bg-muted/30 focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0">{faq.question}</span>
                      <ChevronDown
                        className="size-3.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="border-t border-border/50 px-3.5 py-3 text-[11px] leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </section>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border/60 bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-[10px] leading-relaxed text-muted-foreground sm:max-w-md">
              {guide.footnote}
            </p>
            <Button
              type="button"
              size="sm"
              className="w-full shrink-0 sm:w-auto"
              onClick={() => handleOpenChange(false)}
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

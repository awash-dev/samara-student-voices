"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  HelpCircle,
  Mail,
  PhoneCall,
  Scale,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CHANNELS,
  EMERGENCY_CONTACTS,
  FAQ_ITEMS,
  ROLE_PROFILES,
  STATS,
} from "@/lib/marketing/content"
import { cn } from "@/lib/utils"

export function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [activeRoleIndex, setActiveRoleIndex] = useState(0)
  const [contacts, setContacts] = useState(EMERGENCY_CONTACTS)

  useEffect(() => {
    let active = true
    fetch("/api/platform-settings/emergency-contacts")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && Array.isArray(data?.contacts) && data.contacts.length > 0) {
          setContacts(data.contacts)
        }
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader />

      <main id="main-content" className="flex-1">

        {/* ─── Hero ─────────────────────────────────────────────────────── */}
        <section className="scroll-mt-20 border-b border-border/60 py-12 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-5">
              <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
                <span className="flex size-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span className="min-w-0">Samara University — Student Voice Network</span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
                Report Harassment.<br />
                Protect Your Privacy.<br />
                <span className="text-primary">Be Heard.</span>
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                A confidential reporting platform for Samara University students. Submit harassment reports or campus feedback anonymously — routed securely to the right review team.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 pt-2">
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
                >
                  <span>Register with Student Email</span>
                  <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                </Link>
                <Link
                  href="/auth/sign-in"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Sign in
                </Link>
              </div>

              <a
                href="#emergency"
                className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline pt-1"
              >
                <ShieldAlert className="size-3.5 shrink-0" />
                <span>Immediate safety threat? See 24/7 Crisis Contacts</span>
              </a>
            </div>
          </div>
        </section>

        {/* ─── Trust Stats ──────────────────────────────────────────────── */}
        <section className="border-b border-border/60 py-8 sm:py-10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="min-w-0 space-y-0.5">
                  <p className="text-xl font-bold text-foreground font-mono sm:text-2xl">{s.value}</p>
                  <p className="text-xs font-semibold text-foreground/80">{s.label}</p>
                  <p className="text-[11px] text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Emergency Contacts ──────────────────────────────────────── */}
        <section id="emergency" className="scroll-mt-20 border-b border-border/60 bg-rose-500/[0.03] py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
            <div>
              <div className="inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-md bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 mb-3">
                <ShieldAlert className="size-3.5 shrink-0" />
                24/7 Female Student Safety Hotline
              </div>
              <h2 className="text-lg font-bold text-foreground">
                Immediate Campus Support
              </h2>
              <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                If you are facing sexual harassment, stalking, or physical intimidation — contact these official channels immediately or file an anonymous emergency report.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {contacts.map((c) => (
                <div key={c.role} className="min-w-0 rounded-xl border border-border bg-card p-4 text-xs space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{c.role}</p>
                      <p className="text-muted-foreground">{c.available}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">{c.badge}</span>
                  </div>
                  <a
                    href={`tel:${c.phone.replace(/[^0-9+]/g, "")}`}
                    className="flex max-w-full items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 px-3 py-1.5 text-xs font-bold text-white transition-colors w-fit"
                  >
                    <PhoneCall className="size-3.5 shrink-0" />
                    <span className="truncate">{c.phone}</span>
                  </a>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/15 px-4 py-2.5 text-sm font-semibold text-rose-700 dark:text-rose-300 transition-colors"
              >
                File Emergency Anonymous Report
                <ArrowRight className="size-4 shrink-0" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Reporting Channels ──────────────────────────────────────── */}
        <section id="channels" className="scroll-mt-20 border-b border-border/60 py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Reporting Pathways</p>
              <h2 className="text-2xl font-bold text-foreground">Three Dedicated Channels</h2>
              <p className="text-sm text-muted-foreground">Each channel routes to specialized care with privacy rules and executive response protocols.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {CHANNELS.map((ch) => {
                const isGirlSafety = ch.id === "girl-safety"
                const isHarassment = ch.id === "harassment"

                return (
                  <Card key={ch.id} className="flex flex-col border-border/70">
                    <CardHeader className="space-y-2 pb-3">
                      <div className="flex items-center gap-2">
                        {isGirlSafety && <ShieldAlert className="size-4 text-rose-500" />}
                        {isHarassment && <AlertTriangle className="size-4 text-amber-500" />}
                        {!isGirlSafety && !isHarassment && <BookOpen className="size-4 text-primary" />}
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded",
                            isGirlSafety && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                            isHarassment && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                            !isGirlSafety && !isHarassment && "bg-primary/10 text-primary"
                          )}
                        >
                          {ch.tag}
                        </span>
                      </div>
                      <CardTitle className="text-sm font-bold text-foreground">{ch.title}</CardTitle>
                      <CardDescription className="text-xs leading-relaxed">{ch.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col flex-1 pt-0 space-y-4">
                      <ul className="space-y-1.5 border-t border-border/50 pt-3">
                        {ch.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <Check className={cn(
                              "size-3 mt-0.5 shrink-0",
                              isGirlSafety && "text-rose-500",
                              isHarassment && "text-amber-500",
                              !isGirlSafety && !isHarassment && "text-primary"
                            )} />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      <Link
                        href="/auth/sign-up"
                        className={cn(
                          "mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors",
                          isGirlSafety && "bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/15",
                          isHarassment && "bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15",
                          !isGirlSafety && !isHarassment && "bg-primary/10 text-primary hover:bg-primary/15"
                        )}
                      >
                        Submit via this Channel
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* ─── Role Architecture ───────────────────────────────────────── */}
        <section id="how-it-works" className="border-b border-border/60 bg-muted/20 py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">System Architecture</p>
              <h2 className="text-2xl font-bold text-foreground">4-Role Governance</h2>
              <p className="text-sm text-muted-foreground">Strict separation of powers ensures no single person can hide or suppress student reports.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {ROLE_PROFILES.map((rp, idx) => (
                <button
                  key={rp.role}
                  type="button"
                  onClick={() => setActiveRoleIndex(idx)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                    activeRoleIndex === idx
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  )}
                >
                  {rp.role}
                  <span className="ml-1.5 opacity-60 font-normal">({rp.badge})</span>
                </button>
              ))}
            </div>

            {(() => {
              const current = ROLE_PROFILES[activeRoleIndex]
              return (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {current.role === "Student" && <Users className="size-4" />}
                          {current.role === "Executive" && <ShieldCheck className="size-4" />}
                          {current.role === "Admin" && <UserCheck className="size-4" />}
                          {current.role === "Super Admin" && <Scale className="size-4" />}
                        </div>
                        <h3 className="text-sm font-bold text-foreground">{current.role} Role</h3>
                        <Badge variant="secondary" className="text-[10px]">{current.badge}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{current.visibility}</p>
                    </div>
                  </div>
                  <div className="p-5 grid gap-2 sm:grid-cols-2">
                    {current.powers.map((p) => (
                      <div key={p} className="flex items-start gap-2 text-xs text-foreground/85">
                        <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        </section>

        {/* ─── FAQ ─────────────────────────────────────────────────────── */}
        <section id="faq" className="border-b border-border/60 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">FAQ</p>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">Frequently Asked Questions</h2>
              <p className="text-sm text-muted-foreground">Honest answers about your security, privacy, and how reports are handled.</p>
            </div>

            <div className="space-y-2">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = activeFaq === idx
                return (
                  <div
                    key={item.question}
                    className="rounded-xl border border-border bg-card overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-4 font-semibold text-sm text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <span className="flex min-w-0 items-start gap-2 text-left">
                        <HelpCircle className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                        {item.question}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-4 text-muted-foreground shrink-0 transition-transform duration-150",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-border/50">
                        {item.answer}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ─── Live Simulator ────────────────────────────────────────────── */}
        <section id="simulator" className="border-b border-border/60 bg-muted/20 py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Live Demo</p>
              <h2 className="text-2xl font-bold text-foreground">Try the Reporting Flow</h2>
              <p className="text-sm text-muted-foreground">Experience how a student submits a report and how executives review it — no sign-up required.</p>
            </div>

            <Simulator />
          </div>
        </section>

        {/* ─── Final CTA ───────────────────────────────────────────────── */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-border bg-card p-6 sm:p-10">
              <div className="mb-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
                Protected by Samara University Peace Charter
              </div>
              <h2 className="mb-3 text-xl font-bold text-foreground sm:text-2xl">
                Your Voice Changes Campus.
              </h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-xl">
                Join Samara University students who trust this system to resolve harassment, protect female students, and demand better academic conditions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
                >
                  Create Your Safe Account
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/auth/sign-in"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Sign in to Existing Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

// ─── Simulator Component ───────────────────────────────────────────────────
function Simulator() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    type: "feedback" as "harassment" | "feedback",
    anonymous: true,
    content: "",
  })

  const steps = [
    { label: "Choose Type", icon: <BookOpen className="size-4" /> },
    { label: "Write Report", icon: <Mail className="size-4" /> },
    { label: "Privacy Settings", icon: <Shield className="size-4" /> },
    { label: "Submitted", icon: <ShieldCheck className="size-4" /> },
    { label: "Executive View", icon: <Send className="size-4" /> },
  ]

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1))
  const prevStep = () => setStep((s) => Math.max(s - 1, 0))

  const reset = () => {
    setStep(0)
    setFormData({ type: "feedback", anonymous: true, content: "" })
  }

  // Stable demo IDs (no impure calls in render)
  const trackingCode = "SVP-A7K9M2-XY9F3K"
  const messageId = formData.type === "harassment" ? "HRS-B4T8" : "FDB-N9Q1"

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Progress indicator */}
      <div className="border-b border-border bg-muted/30 px-4 py-3 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {steps.map((s, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "size-6 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    idx < step
                      ? "bg-emerald-500 text-white"
                      : idx === step
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {idx < step ? <Check className="size-3.5" /> : s.icon}
                </div>
                <span className={cn("text-xs font-medium hidden sm:block", idx <= step ? "text-foreground" : "text-muted-foreground")}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "hidden sm:block size-1.5 flex-1 max-w-[60px] mx-1 rounded transition-colors",
                    idx < step ? "bg-emerald-500" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Step 0: Choose Type */}
        {step === 0 && (
          <div className="space-y-4" data-step="type">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold">What type of report?</h3>
              <p className="text-sm text-muted-foreground">Each channel has different privacy rules and routing.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { id: "harassment", title: "Harassment & Safety", desc: "Sexual harassment, stalking, intimidation. Routes to Super Admin + Executive. Always anonymous.", icon: <AlertTriangle className="size-5 text-rose-500" />, tag: "RESTRICTED" },
                { id: "feedback", title: "Campus Feedback", desc: "Academic issues, facilities, policy suggestions. Routes to Executive team. Optional anonymity.", icon: <BookOpen className="size-5 text-primary" />, tag: "STANDARD" },
              ].map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setFormData((d) => ({ ...d, type: ch.id as "harassment" | "feedback" }))
                    nextStep()
                  }}
                  className={cn(
                    "relative p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50",
                    formData.type === ch.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {ch.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{ch.title}</h4>
                        <Badge variant="secondary" className="text-[9px]">{ch.tag}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{ch.desc}</p>
                    </div>
                  </div>
                  {formData.type === ch.id && (
                    <div className="absolute inset-0 rounded-xl ring-2 ring-primary/30 pointer-events-none" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Write Report */}
        {step === 1 && (
          <div className="space-y-4" data-step="write">
            <div>
              <label className="block text-sm font-medium mb-2">Your Report</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData((d) => ({ ...d, content: e.target.value }))}
                rows={6}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder={formData.type === "harassment"
                  ? "Describe what happened. Include dates, locations, and any witnesses if you feel safe doing so. This report is completely anonymous."
                  : "Share your feedback about campus life, academics, facilities, or policies. You can choose to remain anonymous or attach your name."}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.content.length}/2000 characters
              </p>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              {formData.type === "harassment"
                ? "⚠️ Harassment reports are permanently anonymous. No one — not even Super Admin — can see your identity."
                : "💡 You can choose anonymity in the next step."}
            </div>
          </div>
        )}

        {/* Step 2: Privacy Settings */}
        {step === 2 && (
          <div className="space-y-4" data-step="privacy">
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Shield className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Anonymous Submission</p>
                    <p className="text-xs text-muted-foreground">
                      {formData.type === "harassment"
                        ? "Required for harassment reports — your identity is never stored"
                        : "Your name and email will not be attached to this report"}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.anonymous}
                  onChange={(e) => setFormData((d) => ({ ...d, anonymous: e.target.checked }))}
                  disabled={formData.type === "harassment"}
                  className="size-4 rounded border-border text-primary focus:ring-primary/20"
                />
              </div>
              {formData.type === "harassment" && (
                <p className="text-xs text-rose-600 dark:text-rose-400 ml-12">
                  Harassment reports must be anonymous to protect reporters
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border p-4 space-y-2 bg-muted/30">
              <h4 className="text-sm font-medium text-foreground">What happens next</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-500" /> Report encrypted and stored</li>
                <li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-500" /> Routed to {formData.type === "harassment" ? "Super Admin + Executive" : "Executive team"}</li>
                <li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-500" /> You receive a tracking code</li>
                <li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-500" /> Executive replies appear in your dashboard</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 3: Submitted */}
        {step === 3 && (
          <div className="space-y-4 text-center" data-step="submitted">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 mx-auto">
              <ShieldCheck className="size-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Report Submitted</h3>
              <p className="text-sm text-muted-foreground mt-1">Your report has been received and routed securely.</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2 text-left">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tracking Code</span>
                <code className="font-mono text-foreground bg-background px-2 py-0.5 rounded">{trackingCode}</code>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary">Pending Review</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Channel</span>
                <Badge variant={formData.type === "harassment" ? "destructive" : "default"}>{formData.type === "harassment" ? "Harassment" : "Feedback"}</Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Switching to executive view...</p>
          </div>
        )}

        {/* Step 4: Executive View */}
        {step === 4 && (
          <div className="space-y-4" data-step="executive">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">Executive Dashboard</Badge>
              <Badge variant="outline" className="text-xs">Inbox</Badge>
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-muted/50 border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                New Message Received
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-muted-foreground">#{messageId}</span>
                      <Badge variant={formData.type === "harassment" ? "destructive" : "secondary"} className="text-[9px]">{formData.type === "harassment" ? "Harassment" : "Feedback"}</Badge>
                      {formData.anonymous && <Badge variant="outline" className="text-[9px]">Anonymous</Badge>}
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">{formData.content || "Sample report content..."}</p>
                    <p className="text-xs text-muted-foreground">Submitted just now</p>
                  </div>
                </div>
                <div className="rounded-lg border border-border p-3 bg-muted/30">
                  <p className="text-xs font-medium text-foreground mb-2">Executive Actions</p>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      <Send className="size-3 mr-1" /> Reply
                    </button>
                    <button className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors">
                      <ShieldCheck className="size-3 mr-1" /> Mark In Review
                    </button>
                    <button className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors">
                      <AlertTriangle className="size-3 mr-1" /> Escalate
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Student receives email + in-app notification with your reply. All communication stays in the platform.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 0}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <div className="flex gap-2">
            {step < 3 && (
              <button
                type="button"
                onClick={nextStep}
                disabled={step === 1 && !formData.content.trim()}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            )}
            {step === 3 && null}
            {step === 4 && (
              <button
                type="button"
                onClick={reset}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Flame,
  HelpCircle,
  Lock,
  MessageSquare,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type DemoCategory = "girl-safety" | "harassment" | "feedback"
type DemoRole = "student" | "executive" | "superadmin"

const DEMO_TEMPLATES = {
  "girl-safety": {
    title: "Suspicious individual following female students near Dorm 4",
    content: "Yesterday around 9:30 PM near the block B pathway, an unidentified person was harassing women returning from study hall. We need emergency lighting and security patrols.",
    type: "Girl Student Safety",
    urgency: "High / Urgent",
    categoryColor: "rose",
  },
  harassment: {
    title: "Department lecturer demanding money to approve laboratory project",
    content: "A teaching assistant is refusing to stamp senior clearance forms unless students pay a fee outside official university bank slips. This is extortion.",
    type: "Academic Harassment",
    urgency: "Medium / Critical Review",
    categoryColor: "amber",
  },
  feedback: {
    title: "Engineering computer lab workstations have no power during exams",
    content: "The backup generators were not started during the 2:00 PM digital exam, causing 45 students to lose exam submissions. Requesting UPS battery installation.",
    type: "Campus Voice / Feedback",
    urgency: "Standard",
    categoryColor: "indigo",
  },
}

export function ShieldSimulator() {
  const [category, setCategory] = useState<DemoCategory>("girl-safety")
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [activeRole, setActiveRole] = useState<DemoRole>("student")
  const [lookupCode, setLookupCode] = useState("")
  const [searchedCase, setSearchedCase] = useState<{
    code: string
    title: string
    status: "in_review" | "resolved" | "pending"
    type: string
    updated: string
  } | null>(null)

  const currentTemplate = DEMO_TEMPLATES[category]

  const handleSearchCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (!lookupCode.trim()) return

    // Demo lookup response
    setSearchedCase({
      code: lookupCode.toUpperCase(),
      title: "Dormitory Corridor Lighting & Security Escort",
      status: "in_review",
      type: "Girl & Women Safety",
      updated: "14 minutes ago by Student Executive Council",
    })
  }

  return (
    <section id="simulator" className="relative overflow-hidden py-16 sm:py-24 border-y border-border/80 bg-muted/20">
      {/* Background cyber accent dots */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--color-primary)/0.06,transparent_40%),radial-gradient(circle_at_top_right,rgba(225,29,72,0.06),transparent_40%)]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            <span>Interactive Zero-Knowledge Shield</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Test How Your Anonymity Works Live
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            See for yourself how our 4-role privacy engine protects your identity when reporting harassment or girl safety incidents.
          </p>
        </div>

        {/* Interactive Simulator Shell */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-border/80 bg-card/80 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  <span>1. Configure Test Report</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Choose a reporting scenario and toggle your privacy mode.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Scenario buttons */}
                <div>
                  <label className="text-xs font-semibold text-foreground/80 block mb-2">
                    Select Report Category:
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => setCategory("girl-safety")}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all",
                        category === "girl-safety"
                          ? "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold shadow-xs"
                          : "border-border hover:bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <ShieldAlert className="size-4 text-rose-500" />
                        Girl Student Safety Issue
                      </span>
                      <span className="text-[10px] uppercase font-bold text-rose-500">Urgent</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCategory("harassment")}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all",
                        category === "harassment"
                          ? "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold shadow-xs"
                          : "border-border hover:bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="size-4 text-amber-500" />
                        Academic Harassment / Extortion
                      </span>
                      <span className="text-[10px] uppercase font-bold text-amber-500">Protected</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCategory("feedback")}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all",
                        category === "feedback"
                          ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs"
                          : "border-border hover:bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <MessageSquare className="size-4 text-indigo-500" />
                        Campus Voice & Facility Feedback
                      </span>
                      <span className="text-[10px] uppercase font-bold text-indigo-500">Council</span>
                    </button>
                  </div>
                </div>

                {/* Anonymity Switch */}
                <div className="pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/80">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        {isAnonymous ? <EyeOff className="size-3.5 text-emerald-500" /> : <Eye className="size-3.5 text-muted-foreground" />}
                        Identity Masking
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {isAnonymous ? "Your identity is stripped at query level" : "Displaying your university email"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer",
                        isAnonymous ? "bg-emerald-600" : "bg-muted-foreground/30"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block size-4 transform rounded-full bg-white transition-transform shadow-xs",
                          isAnonymous ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Simulated Sender Credentials */}
                <div className="rounded-xl border border-dashed border-border/80 p-3 bg-muted/20 text-xs space-y-1">
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>Original Student Profile:</span>
                    <span className="font-mono">ID #SU-2024-ENG-088</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Account Email:</span>
                    <span className="font-mono">student.sara@su.edu.et</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Demo Tracker */}
            <Card className="border-border/80 bg-card/60 backdrop-blur-md">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <Search className="size-3.5 text-primary" />
                  <span>Public Case Status Lookup</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <form onSubmit={handleSearchCode} className="flex gap-2">
                  <input
                    type="text"
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value)}
                    placeholder="Try code: SU-SAFE-2026"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                  />
                  <Button type="submit" size="sm" className="text-xs h-8">
                    Lookup
                  </Button>
                </form>
                {searchedCase && (
                  <div className="mt-3 p-2.5 rounded-lg border border-primary/20 bg-primary/5 text-xs space-y-1 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-primary">{searchedCase.code}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-[10px] font-bold">
                        <Clock className="size-2.5" />
                        In Review
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-foreground">{searchedCase.title}</p>
                    <p className="text-[10px] text-muted-foreground">{searchedCase.updated}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Perspective Viewer Column */}
          <div className="lg:col-span-7 space-y-4">
            {/* Role Perspective Switcher Tabs */}
            <div className="flex items-center justify-between p-1 rounded-xl bg-muted/60 border border-border/80">
              <span className="text-xs font-semibold px-3 text-muted-foreground hidden sm:inline">
                Inspect Perspective:
              </span>
              <div className="flex items-center gap-1 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveRole("student")}
                  className={cn(
                    "flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    activeRole === "student"
                      ? "bg-card text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  🎓 Student View
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRole("executive")}
                  className={cn(
                    "flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    activeRole === "executive"
                      ? "bg-card text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  👔 Executive View
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRole("superadmin")}
                  className={cn(
                    "flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    activeRole === "superadmin"
                      ? "bg-card text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  👑 Super Admin Audit
                </button>
              </div>
            </div>

            {/* Screen Mockup */}
            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xl">
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-rose-500/80" />
                    <span className="size-2.5 rounded-full bg-amber-500/80" />
                    <span className="size-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-muted-foreground ml-2">
                    {activeRole === "student" && "portal.samara.edu.et/dashboard/messages/view"}
                    {activeRole === "executive" && "portal.samara.edu.et/executive/inbox/triage"}
                    {activeRole === "superadmin" && "portal.samara.edu.et/superadmin/audit-logs"}
                  </span>
                </div>

                <span className="font-medium text-[11px] px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                  {activeRole === "student" && "Confidential Thread"}
                  {activeRole === "executive" && "Triage Mode"}
                  {activeRole === "superadmin" && "Safety Oversight Log"}
                </span>
              </div>

              {/* View Content */}
              <div className="p-5 sm:p-6 space-y-4">
                {/* Banner inside mock */}
                {activeRole === "student" && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                    <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                        {isAnonymous ? "Anonymous Shield Active" : "Identified Report Mode"}
                      </p>
                      <p className="text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                        {isAnonymous
                          ? "Your identity is protected. Anonymous reports are routed only to Super Admin."
                          : "Identified feedback is routed to the executive team, who can see your university email."}
                      </p>
                    </div>
                  </div>
                )}

                {activeRole === "executive" && (
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
                    <Lock className="size-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-primary">Executive Triage Safeguard</p>
                      <p className="text-muted-foreground mt-0.5">
                        {isAnonymous
                          ? "Anonymous reports are hidden from the executive inbox and handled only by Super Admin."
                          : "Student chose to share their identity for direct support."}
                      </p>
                    </div>
                  </div>
                )}

                {activeRole === "superadmin" && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-3">
                    <Shield className="size-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-purple-800 dark:text-purple-300">
                        Full Transparency & Audit Authority
                      </p>
                      <p className="text-purple-700/80 dark:text-purple-400/80 mt-0.5">
                        Super Admin can review case timestamps and status history without exposing anonymous identity, ensuring executives do not bury complaints.
                      </p>
                    </div>
                  </div>
                )}

                {/* The Message Record */}
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-mono">
                        REF #SU-8492
                      </Badge>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400">
                        {currentTemplate.type}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">Just now</span>
                  </div>

                  {/* Sender Field Mock */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-card border border-border/80">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                        Sender Identity:
                      </span>
                      {activeRole === "student" && (
                        <span className="font-mono font-medium text-foreground">
                          {isAnonymous ? "You (Masked as Anonymous #8492)" : "student.sara@su.edu.et"}
                        </span>
                      )}
                      {activeRole === "executive" && (
                        <span className="font-mono font-semibold">
                          {isAnonymous ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <EyeOff className="size-3" /> [PROTECTED ANONYMOUS]
                            </span>
                          ) : (
                            <span className="text-foreground">student.sara@su.edu.et</span>
                          )}
                        </span>
                      )}
                      {activeRole === "superadmin" && (
                        isAnonymous ? (
                          <span className="flex items-center gap-1 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            <EyeOff className="size-3" /> [IDENTITY PROTECTED]
                          </span>
                        ) : (
                          <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                            student.sara@su.edu.et (UUID: 7f3a...b10)
                          </span>
                        )
                      )}
                    </div>

                    <div className="p-2 rounded-lg bg-card border border-border/80">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                        Case Urgency:
                      </span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        {currentTemplate.urgency}
                      </span>
                    </div>
                  </div>

                  {/* Title & Body */}
                  <div className="space-y-1.5 pt-1">
                    <h4 className="text-sm font-bold text-foreground">
                      {currentTemplate.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {currentTemplate.content}
                    </p>
                  </div>

                  {/* Executive Action Bar Preview */}
                  {activeRole === "executive" && (
                    <div className="pt-3 border-t border-border/60 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold text-muted-foreground mr-1">Triage Action:</span>
                      <button className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-primary text-primary-foreground">
                        Accept & Start Investigation
                      </button>
                      <button className="px-2.5 py-1 rounded-md text-[11px] font-medium border border-border hover:bg-muted">
                        Reply Anonymously to Student
                      </button>
                    </div>
                  )}

                  {/* Super Admin Audit Trail Preview */}
                  {activeRole === "superadmin" && (
                    <div className="pt-3 border-t border-border/60 font-mono text-[10px] text-muted-foreground space-y-1">
                      <p>❯ [AUDIT] Event: SUBMIT_REPORT | Source_IP: 197.156.x.x | Timestamp: 2026-10-25 22:15:00 UTC</p>
                      <p>❯ [AUDIT] Receiver_Queue: EXECUTIVE_WELFARE_COUNCIL | Status: QUEUED_PENDING</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

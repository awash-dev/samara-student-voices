"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Fingerprint,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageSquare,
  Radio,
  RefreshCw,
  Scale,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  UserCheck,
  UserCog,
  Users,
  Zap,
} from "lucide-react"

import { AdminTable, AdminTableSkeleton } from "@/components/AdminTable"
import { AdminUsersPanel } from "@/components/dashboard/admin-users-panel"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import {
  SuperadminMessagesPanel,
  type SuperadminMessage,
} from "@/components/dashboard/superadmin-messages-panel"
import { SuperadminAuditPanel } from "@/components/dashboard/superadmin-audit-panel"
import { SuperadminPrivacyAuditPanel } from "@/components/dashboard/superadmin-privacy-audit-panel"
import { ToastBanner } from "@/components/dashboard/toast-banner"
import { ChangePasswordCard } from "@/components/auth/change-password-card"
import { CookiePrivacyControllerCard } from "@/components/dashboard/cookie-privacy-controller-card"
import { EmergencyContactsEditorCard } from "@/components/dashboard/emergency-contacts-editor-card"
import { SignOutButton } from "@/components/SignOutButton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/StatusBadge"
import { DASHBOARD_COPY } from "@/lib/dashboard/copy"
import type { AppRole } from "@/lib/auth/roles"
import type { SessionUser } from "@/lib/session"
import { cn } from "@/lib/utils"

const copy = DASHBOARD_COPY.superadmin

type PendingUser = {
  id: string
  email: string
  role: AppRole
  approved: boolean
  createdAt: string
}

type Stats = {
  totalStudents: number
  totalExecutives: number
  pendingStudents: number
  pendingExecutives: number
  totalApproved: number
  totalPending: number
}

type ActiveView =
  | "overview"
  | "messages"
  | "activity"
  | "privacy"
  | "approvals"
  | "users"
  | "profile"

export function SuperadminDashboardClient({ user }: { user: SessionUser }) {
  const [activeView, setActiveView] = useState<ActiveView>("overview")
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [messages, setMessages] = useState<SuperadminMessage[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  )

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [regRes, statsRes, msgRes] = await Promise.all([
        fetch("/api/admin/registrations"),
        fetch("/api/admin/stats"),
        fetch("/api/messages"),
      ])
      if (regRes.ok) setPendingUsers(await regRes.json())
      if (statsRes.ok) setStats(await statsRes.json())
      if (msgRes.ok) setMessages(await msgRes.json())
    } catch {
      setToast({ type: "error", text: "Failed to load dashboard data" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  // Direct open by URL query param ?id=...
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    if (params.get("id") || params.get("messageId")) {
      setActiveView("messages")
    }
  }, [])

  const handleApprove = async (id: string) => {
    const res = await fetch(`/api/admin/approve/${id}`, { method: "PATCH" })
    if (res.ok) {
      setToast({ type: "success", text: "User approved successfully" })
      void fetchData()
    } else {
      setToast({ type: "error", text: "Approval failed" })
    }
    setTimeout(() => setToast(null), 4000)
  }

  const handleReject = async (id: string) => {
    const res = await fetch(`/api/admin/reject/${id}`, { method: "DELETE" })
    if (res.ok) {
      setToast({ type: "success", text: "User rejected" })
      void fetchData()
    } else {
      setToast({ type: "error", text: "Rejection failed" })
    }
    setTimeout(() => setToast(null), 4000)
  }

  const handleOpenMessage = (msgId: string) => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("id", msgId)
      window.history.pushState({}, "", url.toString())
    }
    setActiveView("messages")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const navItems = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
    {
      id: "messages",
      label: "Messages",
      icon: <MessageSquare className="size-4" />,
      badge: messages.filter((m) => m.status === "pending").length,
    },
    { id: "activity", label: "Activity Stream", icon: <Activity className="size-4" /> },
    { id: "privacy", label: "Privacy Audit", icon: <Fingerprint className="size-4" /> },
    {
      id: "approvals",
      label: "Approvals",
      icon: <Users className="size-4" />,
      badge: stats?.totalPending,
    },
    { id: "users", label: "All Users", icon: <UserCog className="size-4" /> },
    { id: "profile", label: "Profile & Security", icon: <User className="size-4" /> },
  ]

  // Derived metrics
  const harassmentCount = messages.filter((m) => m.type === "harassment").length
  const feedbackCount = messages.filter((m) => m.type === "feedback").length
  const girlSafetyCount = messages.filter((m) => m.type === "girl_safety").length
  const resolvedCount = messages.filter((m) => m.status === "resolved").length
  const pendingCount = messages.filter((m) => m.status === "pending").length
  const inReviewCount = messages.filter((m) => m.status === "in_review").length

  const resolutionRate = messages.length > 0
    ? Math.round((resolvedCount / messages.length) * 100)
    : 100

  // Top pending urgent cases for overview queue
  const pendingQueue = messages.filter((m) => m.status === "pending").slice(0, 3)

  return (
    <DashboardShell
      user={user}
      role="superadmin"
      title="Master Oversight"
      navItems={navItems}
      activeId={activeView}
      onNavigate={(id) => setActiveView(id as ActiveView)}
    >
      {toast ? <ToastBanner type={toast.type} message={toast.text} /> : null}

      {/* ═══════════════════════════════════════════════════════════════
          1. FULLY REDESIGNED CENTRAL COMMAND OVERVIEW
      ═══════════════════════════════════════════════════════════════ */}
      {activeView === "overview" && (
        <div className="w-full space-y-6 animate-in fade-in duration-200">
          {/* ── Executive Hero Header ── */}
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-primary/10 via-card to-card p-4 shadow-sm sm:p-6">
            <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                    <Scale className="size-5" />
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    Super Admin Central Command
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE COMPLIANCE MESH ACTIVE
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  Real-time university safety oversight, identity-protected case reviews, executive SLA response audits, and account governance.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={fetchData}
                  className="text-xs h-9 px-3.5 rounded-xl shadow-xs cursor-pointer border-border/80 bg-background/80"
                >
                  <RefreshCw className={cn("size-3.5 mr-1.5", loading && "animate-spin text-primary")} />
                  Refresh Metrics
                </Button>

                <Button
                  size="sm"
                  onClick={() => setActiveView("messages")}
                  className="text-xs h-9 px-4 rounded-xl shadow-xs cursor-pointer bg-primary text-primary-foreground font-bold"
                >
                  <MessageSquare className="size-3.5 mr-1.5" />
                  View All Reports ({messages.length})
                </Button>
              </div>
            </div>
          </div>

          {/* ── Executive KPI Bento Grid ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Total Student Cases */}
            <Card className="rounded-2xl border-border/80 bg-card p-4 transition-all duration-200 hover:border-primary/40 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Total Submissions
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MessageSquare className="size-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="text-3xl font-black tabular-nums text-foreground">{messages.length}</p>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    100% Audited
                  </span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5 pt-3 border-t border-border/50 text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  {harassmentCount} Harassment
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  {feedbackCount} Feedback
                </span>
                {girlSafetyCount > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400">
                    {girlSafetyCount} Girl Safety
                  </span>
                )}
              </div>
            </Card>

            {/* 2. Pending Executive Triage */}
            <Card className="rounded-2xl border-amber-500/30 bg-amber-500/[0.03] p-4 transition-all duration-200 hover:border-amber-500/60 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                    Pending Triage
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600">
                    <Clock className="size-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="text-3xl font-black tabular-nums text-amber-600 dark:text-amber-400">
                    {pendingCount}
                  </p>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    awaiting response
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-amber-500/20 flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted-foreground">Executive Committee SLA</span>
                <button
                  type="button"
                  onClick={() => setActiveView("messages")}
                  className="text-amber-600 dark:text-amber-400 font-bold hover:underline inline-flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <span>Review Queue</span>
                  <ArrowRight className="size-3" />
                </button>
              </div>
            </Card>

            {/* 3. Case Resolution Rate */}
            <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/[0.03] p-4 transition-all duration-200 hover:border-emerald-500/60 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                    Resolution Rate
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600">
                    <CheckCircle2 className="size-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="text-3xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                    {resolutionRate}%
                  </p>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {resolvedCount} of {messages.length} closed
                  </span>
                </div>
              </div>
              <div className="mt-3 space-y-1 pt-3 border-t border-emerald-500/20">
                <div className="h-1.5 w-full rounded-full bg-emerald-500/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${resolutionRate}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground text-right">{inReviewCount} in active review</p>
              </div>
            </Card>

            {/* 4. Verified Directory Accounts */}
            <Card className="rounded-2xl border-border/80 bg-card p-4 transition-all duration-200 hover:border-primary/40 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Verified Directory
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Users className="size-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="text-3xl font-black tabular-nums text-foreground">
                    {stats?.totalApproved ?? 0}
                  </p>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    active accounts
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                <span className="text-[10px] text-muted-foreground">
                  {stats?.totalStudents ?? 0} students · {stats?.totalExecutives ?? 0} execs
                </span>
                {stats && stats.totalPending > 0 ? (
                  <button
                    type="button"
                    onClick={() => setActiveView("approvals")}
                    className="text-primary font-bold hover:underline inline-flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <span>{stats.totalPending} pending</span>
                    <ArrowRight className="size-3" />
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-600 font-semibold">All approved</span>
                )}
              </div>
            </Card>
          </div>

          {/* ── Urgent Triage Attention Queue ── */}
          <Card className="rounded-3xl border-border/80 bg-card shadow-sm">
            <CardHeader className="p-5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="space-y-0.5">
                <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <AlertCircle className="size-4 text-amber-500" />
                  <span>Urgent Triage Attention Queue</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Student submissions currently awaiting review and official response.
                </CardDescription>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveView("messages")}
                className="text-xs h-8 px-3 rounded-xl cursor-pointer self-start sm:self-auto"
              >
                <span>View Full Inbox</span>
                <ArrowRight className="size-3 ml-1" />
              </Button>
            </CardHeader>

            <CardContent className="p-5">
              {pendingQueue.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground rounded-2xl border border-dashed border-border/80 space-y-2">
                  <CheckCircle2 className="size-8 mx-auto text-emerald-500/80" />
                  <p className="font-bold text-foreground">All Clear — Zero Unresolved Critical Queue</p>
                  <p className="text-[11px]">All student submissions have been assigned or reviewed.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingQueue.map((msg) => {
                    const isHarassment = msg.type === "harassment"
                    const isGirlSafety = msg.type === "girl_safety"
                    // Harassment identity is visible to Super Admin for safety review.
                    const revealIdentity = !msg.anonymous || isHarassment

                    return (
                      <div
                        key={msg.id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase",
                                isHarassment
                                  ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                                  : isGirlSafety
                                  ? "bg-pink-500/15 text-pink-700 dark:text-pink-300"
                                  : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300"
                              )}
                            >
                              {msg.type.replace("_", " ")}
                            </span>
                            <StatusBadge status={msg.status} />
                            <span className="font-mono text-[10px] text-muted-foreground">
                              #{msg.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="max-w-full truncate font-bold text-foreground">
                              {revealIdentity
                                ? msg.senderEmail || "Unknown Sender"
                                : "Anonymous Student"}
                            </span>
                            {msg.anonymous && isHarassment ? (
                              <span className="flex items-center gap-1 text-[9px] font-semibold text-amber-700 dark:text-amber-300">
                                <Eye className="size-2.5" />
                                Super Admin only
                              </span>
                            ) : msg.anonymous ? (
                              <span className="flex items-center gap-1 text-[9px] font-semibold text-rose-600 dark:text-rose-400">
                                <EyeOff className="size-2.5" />
                                Identity protected
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-600">
                                <Eye className="size-2.5" />
                                Public ID
                              </span>
                            )}
                          </div>

                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {msg.content}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleOpenMessage(msg.id)}
                          className="text-xs h-8 px-3.5 rounded-xl cursor-pointer bg-primary text-primary-foreground font-bold shrink-0 self-start sm:self-auto"
                        >
                          <span>Triage & Respond</span>
                          <ArrowRight className="size-3 ml-1" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Transparency Guarantee & Quick Portal Jump ── */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Transparency Powers */}
            <Card className="rounded-3xl border-border/80 bg-card shadow-sm">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-extrabold flex items-center gap-2 text-foreground">
                  <ShieldCheck className="size-4 text-primary" />
                  <span>Master Compliance & Audit Powers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3.5 text-xs text-muted-foreground leading-relaxed">
                <p>
                  As Super Admin, you maintain master compliance authority. Harassment and anonymous
                  reports are restricted to this workspace and never appear in the executive inbox.
                  Harassment reporter identity is visible here only for safety review, even when the
                  student chose anonymous. Anonymous feedback stays masked for everyone, while audit
                  events still record case activity without exposing its identity.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="text-xs h-8.5 rounded-xl px-3.5 cursor-pointer"
                    onClick={() => setActiveView("messages")}
                  >
                    Open Messages
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8.5 rounded-xl px-3.5 cursor-pointer"
                    onClick={() => setActiveView("activity")}
                  >
                    View Activity Stream
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8.5 rounded-xl px-3.5 cursor-pointer"
                    onClick={() => setActiveView("users")}
                  >
                    Manage Users
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Direct Portal Jump Matrix */}
            <Card className="rounded-3xl border-border/80 bg-card shadow-sm">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-extrabold flex items-center gap-2 text-foreground">
                  <Compass className="size-4 text-primary" />
                  <span>Direct Portal Jump Matrix</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 grid gap-2.5 sm:grid-cols-2 text-xs">
                <Link
                  href="/executive"
                  className="flex items-center justify-between p-3 rounded-2xl border border-border/70 bg-muted/20 hover:bg-muted/60 transition-colors font-semibold text-foreground group"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="size-4 text-indigo-500" />
                    <span>Executive Inbox</span>
                  </div>
                  <ExternalLink className="size-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/admin"
                  className="flex items-center justify-between p-3 rounded-2xl border border-border/70 bg-muted/20 hover:bg-muted/60 transition-colors font-semibold text-foreground group"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="size-4 text-blue-500" />
                    <span>Admin Approvals</span>
                  </div>
                  <ExternalLink className="size-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/dashboard"
                  className="flex items-center justify-between p-3 rounded-2xl border border-border/70 bg-muted/20 hover:bg-muted/60 transition-colors font-semibold text-foreground group"
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="size-4 text-emerald-500" />
                    <span>Student Portal</span>
                  </div>
                  <ExternalLink className="size-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <button
                  type="button"
                  onClick={() => setActiveView("users")}
                  className="flex items-center justify-between p-3 rounded-2xl border border-border/70 bg-muted/20 hover:bg-muted/60 transition-colors font-semibold text-foreground group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <UserCog className="size-4 text-purple-500" />
                    <span>User Accounts</span>
                  </div>
                  <ArrowRight className="size-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          2. ALL MESSAGES & SENDER/RECEIVER OVERSIGHT
      ═══════════════════════════════════════════════════════════════ */}
      {activeView === "messages" && (
        <SuperadminMessagesPanel
          messages={messages}
          loading={loading}
          onRefresh={fetchData}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════
          3. LIVE ACTIVITY & AUDIT TRAIL
      ═══════════════════════════════════════════════════════════════ */}
      {activeView === "activity" && (
        <SuperadminAuditPanel
          messages={messages}
          pendingUsers={pendingUsers}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════
          4. CONSENT-GATED PRIVACY & DEVICE AUDIT
      ═══════════════════════════════════════════════════════════════ */}
      {activeView === "privacy" && <SuperadminPrivacyAuditPanel />}

      {/* ═══════════════════════════════════════════════════════════════
          5. APPROVALS VIEW
      ═══════════════════════════════════════════════════════════════ */}
      {activeView === "approvals" && (
        <div className="w-full space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Pending User Approvals ({pendingUsers.length})
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Verify university registrations before granting access to role dashboards.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={fetchData}
              className="self-start text-xs sm:self-auto"
            >
              Refresh
            </Button>
          </div>
          {loading ? (
            <AdminTableSkeleton />
          ) : (
            <AdminTable
              users={pendingUsers}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          5. ALL USERS VIEW
      ═══════════════════════════════════════════════════════════════ */}
      {activeView === "users" && <AdminUsersPanel fullAccess />}

      {/* ═══════════════════════════════════════════════════════════════
          6. PROFILE & SECURITY CENTER (FULL REDESIGN)
      ═══════════════════════════════════════════════════════════════ */}
      {activeView === "profile" && (
        <div className="w-full space-y-6 animate-in fade-in duration-200">
          {/* Profile Hero Header Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-xs sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/15 text-lg font-black text-purple-700 shadow-xs dark:text-purple-300 sm:size-16 sm:text-xl">
                  SA
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-extrabold text-foreground sm:text-xl">
                      {user.name || "System Administrator"}
                    </h2>
                    <span className="rounded-full border border-purple-500/30 bg-purple-500/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-purple-700 dark:text-purple-300">
                      Super Administrator
                    </span>
                    <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3" />
                      Master Clearance
                    </span>
                  </div>
                  <p className="break-all font-mono text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <span className="max-w-full truncate rounded-xl border border-border/60 bg-muted/60 px-3 py-1.5 font-mono text-xs text-muted-foreground">
                  ID: {user.id.slice(0, 8)}...
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(user.id)}
                  className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Copy User UUID"
                >
                  <Copy className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Left Column: Security Clearance & Active Session */}
            <div className="lg:col-span-5 space-y-6">
              {/* Clearance Matrix */}
              <Card className="rounded-3xl border-border/80 bg-card shadow-xs">
                <CardHeader className="p-5 pb-3 border-b border-border/50">
                  <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Fingerprint className="size-4 text-primary" />
                    <span>Security Clearance Matrix</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/30 p-2.5">
                    <span className="min-w-0 text-muted-foreground">Master Audit Privileges</span>
                    <span className="shrink-0 text-right font-bold text-emerald-600 dark:text-emerald-400">Unrestricted</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/30 p-2.5">
                    <span className="min-w-0 text-muted-foreground">Harassment Identity Review</span>
                    <span className="shrink-0 text-right font-bold text-amber-700 dark:text-amber-300">Super Admin only</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/30 p-2.5">
                    <span className="min-w-0 text-muted-foreground">User Approval & Promotion</span>
                    <span className="shrink-0 text-right font-bold text-primary">Full Authority</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/30 p-2.5">
                    <span className="min-w-0 text-muted-foreground">Zero-Knowledge Routing</span>
                    <span className="shrink-0 text-right font-bold text-emerald-600 dark:text-emerald-400">Active</span>
                  </div>
                </CardContent>
              </Card>

              {/* Active Session Info */}
              <Card className="rounded-3xl border-border/80 bg-card shadow-xs">
                <CardHeader className="p-5 pb-3 border-b border-border/50">
                  <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Clock className="size-4 text-primary" />
                    <span>Session Intelligence</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3 text-xs">
                  <dl className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt className="text-[10px] uppercase font-bold text-muted-foreground">Auth Method</dt>
                      <dd className="font-semibold text-foreground mt-0.5">Stateless Bearer JWT</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase font-bold text-muted-foreground">Session Expiry</dt>
                      <dd className="font-semibold text-foreground mt-0.5">12 Hours Auto-Refresh</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase font-bold text-muted-foreground">Database Engine</dt>
                      <dd className="font-semibold text-foreground mt-0.5">Neon Serverless SQL</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase font-bold text-muted-foreground">Live Ably Channel</dt>
                      <dd className="font-semibold text-emerald-600 mt-0.5">Connected</dd>
                    </div>
                  </dl>

                  <div className="pt-3 border-t border-border/50">
                    <SignOutButton
                      showLabel={true}
                      className="w-full justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs py-2.5 h-auto shadow-xs transition-all cursor-pointer"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Platform Settings, Privacy & Security Controls */}
            <div className="lg:col-span-7 space-y-6">
              <EmergencyContactsEditorCard />
              <CookiePrivacyControllerCard />
              <ChangePasswordCard className="rounded-3xl border-border/80" />
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}

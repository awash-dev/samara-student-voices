"use client"

import { useCallback, useEffect, useState } from "react"
import {
  CheckCircle2,
  Clock,
  GraduationCap,
  RefreshCw,
  Settings,
  UserCheck,
  UserCog,
  Users,
} from "lucide-react"

import { AdminTable, AdminTableSkeleton } from "@/components/AdminTable"
import { AdminUsersPanel } from "@/components/dashboard/admin-users-panel"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ToastBanner } from "@/components/dashboard/toast-banner"
import { SignOutButton } from "@/components/SignOutButton"
import { ChangePasswordCard } from "@/components/auth/change-password-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DASHBOARD_COPY } from "@/lib/dashboard/copy"
import type { SessionUser } from "@/lib/session"
import { cn } from "@/lib/utils"

const copy = DASHBOARD_COPY.admin

type PendingUser = {
  id: string
  email: string
  role: "student" | "executive" | "admin"
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

type ActiveView = "approvals" | "users" | "settings"

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3 py-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums leading-none">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminDashboardClient({ user }: { user: SessionUser }) {
  const [activeView, setActiveView] = useState<ActiveView>("approvals")
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  )

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [regRes, statsRes] = await Promise.all([
        fetch("/api/admin/registrations"),
        fetch("/api/admin/stats"),
      ])
      if (regRes.ok) setPendingUsers(await regRes.json())
      else showToast("error", "Failed to load registrations")
      if (statsRes.ok) setStats(await statsRes.json())
    } catch {
      showToast("error", "Network error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const refreshStats = () =>
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStats(d))

  const handleApprove = async (id: string) => {
    const res = await fetch(`/api/admin/approve/${id}`, { method: "PATCH" })
    if (res.ok) {
      setPendingUsers((prev) => prev.filter((u) => u.id !== id))
      void refreshStats()
      showToast("success", "User approved")
    } else {
      showToast("error", "Failed to approve")
      throw new Error("Failed to approve")
    }
  }

  const handleReject = async (id: string) => {
    const res = await fetch(`/api/admin/reject/${id}`, { method: "DELETE" })
    if (res.ok) {
      setPendingUsers((prev) => prev.filter((u) => u.id !== id))
      void refreshStats()
      showToast("success", "User rejected")
    } else {
      showToast("error", "Failed to reject")
      throw new Error("Failed to reject")
    }
  }

  return (
    <DashboardShell
      user={user}
      role="admin"
      title={copy.shellTitle}
      navItems={[
        {
          id: "approvals",
          label: "Registration queue",
          icon: <Users className="size-4" />,
          badge: pendingUsers.length,
        },
        {
          id: "users",
          label: "User management",
          icon: <UserCog className="size-4" />,
        },
        {
          id: "settings",
          label: "Administrator account",
          icon: <Settings className="size-4" />,
        },
      ]}
      activeId={activeView}
      onNavigate={(id) => setActiveView(id as ActiveView)}
    >
      {toast ? <ToastBanner type={toast.type} message={toast.text} /> : null}

      <div className="w-full space-y-6">
        {activeView === "approvals" && (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  {copy.approvals.title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {copy.approvals.description}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={fetchData}
              >
                <RefreshCw
                  className={cn("size-4", loading && "animate-spin")}
                  aria-hidden="true"
                />
                {copy.approvals.refresh}
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label={copy.approvals.stats.approved}
                value={stats?.totalApproved ?? "—"}
                icon={<CheckCircle2 className="size-4 text-primary" />}
              />
              <StatCard
                label={copy.approvals.stats.students}
                value={stats?.totalStudents ?? "—"}
                icon={<GraduationCap className="size-4 text-primary" />}
              />
              <StatCard
                label={copy.approvals.stats.executives}
                value={stats?.totalExecutives ?? "—"}
                icon={<UserCheck className="size-4 text-primary" />}
              />
              <StatCard
                label={copy.approvals.stats.pending}
                value={pendingUsers.length}
                icon={<Clock className="size-4 text-amber-600" />}
              />
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                {copy.approvals.alert}
              </AlertDescription>
            </Alert>

            {loading ? (
              <AdminTableSkeleton />
            ) : (
              <AdminTable
                users={pendingUsers}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            )}
          </>
        )}

        {activeView === "users" ? <AdminUsersPanel /> : null}

        {activeView === "settings" ? (
          <>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                {copy.settings.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {copy.settings.description}
              </p>
            </div>
            <Card>
              <CardContent className="space-y-6 pt-6">
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="mt-0.5 font-medium">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Role</dt>
                    <dd className="mt-0.5 font-medium capitalize">{user.role}</dd>
                  </div>
                </dl>
                <Alert>
                  <AlertDescription className="text-sm">
                    {copy.settings.privacy}
                  </AlertDescription>
                </Alert>
                <ChangePasswordCard />
                <SignOutButton
                  showLabel={true}
                  className="w-full justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs py-2.5 h-auto shadow-xs transition-all cursor-pointer"
                />
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </DashboardShell>
  )
}

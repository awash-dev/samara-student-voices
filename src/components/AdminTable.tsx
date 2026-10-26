"use client"

import { useState } from "react"
import { Check, Clock, Loader2, ShieldCheck, UserCheck, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { AppRole } from "@/lib/auth/roles"
import { cn } from "@/lib/utils"

type PendingUser = {
  id: string
  email: string
  role: AppRole
  approved: boolean
  createdAt: string
}

type AdminTableProps = {
  users: PendingUser[]
  onApprove: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function AdminTable({ users, onApprove, onReject }: AdminTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  if (users.length === 0) {
    return (
      <Card className="rounded-2xl border-dashed border-border/80 p-12 text-center text-xs text-muted-foreground">
        <UserCheck className="size-8 mx-auto mb-2 text-emerald-500/60" />
        <p className="font-bold text-foreground text-sm">All caught up!</p>
        <p className="mt-1 text-muted-foreground">No pending account registrations require approval.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {users.map((user) => {
        const initials = user.email.slice(0, 2).toUpperCase()
        const isStudent = user.role === "student"
        const isExecutive = user.role === "executive"

        return (
          <Card
            key={user.id}
            className="rounded-2xl border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs"
          >
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                  {initials}
                </div>

                <div className="min-w-0 space-y-1">
                  <p className="truncate font-bold text-foreground text-xs sm:text-sm">{user.email}</p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase",
                        isStudent && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                        isExecutive && "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
                        !isStudent && !isExecutive && "bg-purple-500/15 text-purple-700 dark:text-purple-300"
                      )}
                    >
                      {user.role}
                    </span>
                    <span className="font-mono">{formatDate(user.createdAt)}</span>
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-[10px]">
                      <Clock className="size-3" aria-hidden="true" />
                      Pending Approval
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
                <Button
                  size="sm"
                  disabled={loadingId === user.id}
                  onClick={async () => {
                    setLoadingId(user.id)
                    try {
                      await onApprove(user.id)
                    } finally {
                      setLoadingId(null)
                    }
                  }}
                  className="h-9 w-full justify-center rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 sm:h-8 sm:w-auto"
                >
                  {loadingId === user.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <>
                      <Check className="size-3.5 mr-1" />
                      Approve
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={loadingId === user.id}
                  onClick={async () => {
                    setLoadingId(user.id)
                    try {
                      await onReject(user.id)
                    } finally {
                      setLoadingId(null)
                    }
                  }}
                  className="h-9 w-full justify-center rounded-xl border-rose-500/30 px-3 text-xs font-bold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400 sm:h-8 sm:w-auto"
                >
                  <X className="size-3.5 mr-1" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export function AdminTableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 rounded-2xl bg-muted/40 animate-pulse border border-border" />
      ))}
    </div>
  )
}

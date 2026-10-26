"use client"

import { useMemo, useState } from "react"
import {
  Activity,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldAlert,
  UserPlus,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import type { SuperadminMessage } from "./superadmin-messages-panel"
import { cn } from "@/lib/utils"

type Props = {
  messages: SuperadminMessage[]
  pendingUsers: Array<{
    id: string
    email: string
    role: string
    approved: boolean
    createdAt: string
  }>
}

type AuditEvent = {
  id: string
  timestamp: string
  type: "REPORT_FILED" | "REPLY_SENT" | "STATUS_UPDATE" | "USER_REGISTRATION"
  title: string
  actor: string
  target: string
  category?: string
  status?: string
}

export function SuperadminAuditPanel({ messages, pendingUsers }: Props) {
  const [filterType, setFilterType] = useState<string>("ALL")

  // Assemble chronological audit events from real database records
  const auditEvents = useMemo(() => {
    const list: AuditEvent[] = []

    // 1. Report submissions
    messages.forEach((msg) => {
      // Harassment identity is visible to Super Admin for safety review.
      const revealIdentity = !msg.anonymous || msg.type === "harassment"
      const reporter = revealIdentity ? msg.senderEmail || "Student" : "Student (Anonymous)"
      list.push({
        id: `report-${msg.id}`,
        timestamp: msg.createdAt,
        type: "REPORT_FILED",
        title: `Student submitted new ${msg.type.toUpperCase()} report`,
        actor: reporter,
        target: `Case #${msg.id.slice(0, 8)}`,
        category: msg.type,
        status: msg.status,
      })

      // 2. Replies sent
      msg.replies.forEach((rep) => {
        list.push({
          id: `reply-${rep.id}`,
          timestamp: rep.createdAt,
          type: "REPLY_SENT",
          title: "Executive replied to student report",
          actor: rep.senderEmail || "Executive Officer",
          target: `Case #${msg.id.slice(0, 8)} (${reporter})`,
        })
      })

      // 3. Status updates (if not pending)
      if (msg.status !== "pending") {
        list.push({
          id: `status-${msg.id}`,
          timestamp: msg.createdAt,
          type: "STATUS_UPDATE",
          title: `Case status marked as ${msg.status.toUpperCase()}`,
          actor: "Executive Council Triage",
          target: `Case #${msg.id.slice(0, 8)}`,
          status: msg.status,
        })
      }
    })

    // 4. User registrations
    pendingUsers.forEach((u) => {
      list.push({
        id: `user-${u.id}`,
        timestamp: u.createdAt,
        type: "USER_REGISTRATION",
        title: `New ${u.role.toUpperCase()} registration received`,
        actor: u.email,
        target: u.approved ? "Status: Approved" : "Status: Awaiting Admin Approval",
      })
    })

    // Sort newest first
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [messages, pendingUsers])

  const filtered = auditEvents.filter((ev) => {
    if (filterType === "ALL") return true
    return ev.type === filterType
  })

  return (
    <div className="w-full space-y-6">
      {/* Heading */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-start gap-2 text-lg font-bold tracking-tight text-foreground sm:text-xl">
            <Activity className="mt-0.5 size-5 shrink-0 text-primary" />
            <span>Live Activity Stream & System Audit Trail</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable chronological record of student submissions, executive reviews, replies, and account verifications.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border">
        <button
          type="button"
          onClick={() => setFilterType("ALL")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            filterType === "ALL" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
          )}
        >
          All Activity ({auditEvents.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType("REPORT_FILED")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            filterType === "REPORT_FILED" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Reports Filed ({auditEvents.filter((e) => e.type === "REPORT_FILED").length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType("REPLY_SENT")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            filterType === "REPLY_SENT" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Replies ({auditEvents.filter((e) => e.type === "REPLY_SENT").length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType("USER_REGISTRATION")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            filterType === "USER_REGISTRATION" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Registrations ({auditEvents.filter((e) => e.type === "USER_REGISTRATION").length})
        </button>
      </div>

      {/* Audit Timeline */}
      <Card className="border-border/80 bg-card">
        <CardContent className="p-4 sm:p-6 space-y-4">
          {filtered.length === 0 ? (
            <p className="text-center py-8 text-xs text-muted-foreground">No events found for this filter.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => {
                const isReport = item.type === "REPORT_FILED"
                const isReply = item.type === "REPLY_SENT"
                const isStatus = item.type === "STATUS_UPDATE"
                const isUser = item.type === "USER_REGISTRATION"

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors text-xs"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={cn(
                          "size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                          isReport && "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                          isReply && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                          isStatus && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                          isUser && "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                        )}
                      >
                        {isReport && <ShieldAlert className="size-4" />}
                        {isReply && <MessageSquare className="size-4" />}
                        {isStatus && <CheckCircle2 className="size-4" />}
                        {isUser && <UserPlus className="size-4" />}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="min-w-0 break-words font-bold text-foreground">{item.title}</span>
                          <span className="break-all rounded border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                            {item.target}
                          </span>
                        </div>
                        <p className="break-words text-[11px] text-muted-foreground">
                          Actor: <strong className="font-mono font-semibold text-foreground">{item.actor}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start font-mono text-[11px] text-muted-foreground sm:self-center sm:shrink-0">
                      <Clock className="size-3 shrink-0" />
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

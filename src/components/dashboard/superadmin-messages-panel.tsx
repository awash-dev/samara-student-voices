"use client"

import { useEffect, useState } from "react"
import {
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  MessageSquare,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"

import { SuperadminCaseWorkspace } from "@/components/dashboard/superadmin-case-workspace"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/StatusBadge"
import type { SuperadminMessage } from "@/lib/messages/types"
import { cn } from "@/lib/utils"

export type { SuperadminMessage } from "@/lib/messages/types"

type Props = {
  messages: SuperadminMessage[]
  loading: boolean
  onRefresh: () => void
}

export function SuperadminMessagesPanel({
  messages,
  loading,
  onRefresh,
}: Props) {
  const [search, setSearch] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedMessage, setSelectedMessage] = useState<SuperadminMessage | null>(null)

  // Direct open by URL query param `?id=...`
  useEffect(() => {
    if (typeof window === "undefined" || messages.length === 0) return
    const params = new URLSearchParams(window.location.search)
    const idParam = params.get("id") || params.get("messageId")
    if (idParam) {
      const match = messages.find((m) => m.id === idParam || m.id.toLowerCase().startsWith(idParam.toLowerCase()))
      if (match) {
        setSelectedMessage(match)
      }
    }
  }, [messages])

  // Synchronize URL when selecting / closing message
  const handleSelectMessage = (msg: SuperadminMessage | null) => {
    setSelectedMessage(msg)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      if (msg) {
        url.searchParams.set("id", msg.id)
      } else {
        url.searchParams.delete("id")
        url.searchParams.delete("messageId")
      }
      window.history.replaceState({}, "", url.toString())
    }
  }

  // Filter messages
  const filtered = messages.filter((msg) => {
    if (selectedType !== "all" && msg.type !== selectedType) return false
    if (selectedStatus !== "all" && msg.status !== selectedStatus) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchContent = msg.content.toLowerCase().includes(q)
      const matchEmail = (msg.senderEmail || "").toLowerCase().includes(q)
      const matchName = (msg.senderName || "").toLowerCase().includes(q)
      const matchId = msg.id.toLowerCase().includes(q)
      if (!matchContent && !matchEmail && !matchName && !matchId) return false
    }
    return true
  })

  // Counts for single-source-of-truth filter pills
  const pendingCount = messages.filter((m) => m.status === "pending").length
  const inReviewCount = messages.filter((m) => m.status === "in_review").length
  const resolvedCount = messages.filter((m) => m.status === "resolved").length
  const harassmentCount = messages.filter((m) => m.type === "harassment").length
  const feedbackCount = messages.filter((m) => m.type === "feedback").length
  const girlSafetyCount = messages.filter((m) => m.type === "girl_safety").length

  return (
    <div className="w-full space-y-6">
      {/* ─── Clean Header (Zero Duplicate Counters) ──────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-4.5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Student Messages & Reports
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Manage all student submissions, including harassment and anonymous reports restricted
            to Super Admin, and respond directly to students.
          </p>
        </div>

        {/* Clean Refresh Action */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="text-xs h-8.5 px-3.5 rounded-xl shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={cn("size-3.5 mr-1.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* ─── Redesigned Non-Duplicate Filter Hub ───────────────────── */}
      {!selectedMessage && (
        <Card className="border-border/70 bg-card/70 backdrop-blur-xl shadow-xs">
          <CardContent className="p-4 space-y-3.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 size-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student email, name, content, or case ID..."
                className="w-full rounded-xl border border-border/80 bg-background/90 pl-10 pr-10 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground text-xs font-semibold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Controls Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-border/40">
              {/* Category & Status Unified Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mr-1">
                  Category:
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedType("all")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs",
                    selectedType === "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  All ({messages.length})
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedType("harassment")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs",
                    selectedType === "harassment"
                      ? "bg-rose-600 text-white"
                      : "bg-muted/60 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600"
                  )}
                >
                  <ShieldAlert className="size-3" />
                  <span>Harassment ({harassmentCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedType("feedback")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs",
                    selectedType === "feedback"
                      ? "bg-indigo-600 text-white"
                      : "bg-muted/60 text-muted-foreground hover:bg-indigo-500/10 hover:text-indigo-600"
                  )}
                >
                  <BookOpen className="size-3" />
                  <span>Feedback ({feedbackCount})</span>
                </button>

                {girlSafetyCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedType("girl_safety")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs",
                      selectedType === "girl_safety"
                        ? "bg-pink-600 text-white"
                        : "bg-muted/60 text-muted-foreground hover:bg-pink-500/10 hover:text-pink-600"
                    )}
                  >
                    <Shield className="size-3" />
                    <span>Girl Safety ({girlSafetyCount})</span>
                  </button>
                )}
              </div>

              {/* Status Selector */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mr-1">
                  Status:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedStatus("all")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                    selectedStatus === "all"
                      ? "bg-primary/10 text-primary font-bold"
                      : "hover:bg-muted hover:text-foreground"
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus("pending")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1",
                    selectedStatus === "pending"
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold"
                      : "hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  Pending ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus("in_review")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1",
                    selectedStatus === "in_review"
                      ? "bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold"
                      : "hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="size-1.5 rounded-full bg-blue-500" />
                  In Review ({inReviewCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus("resolved")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1",
                    selectedStatus === "resolved"
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold"
                      : "hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Resolved ({resolvedCount})
                </button>

                <span className="ml-0 w-full pl-0 text-[11px] font-medium text-muted-foreground sm:ml-auto sm:w-auto sm:border-l sm:border-border/50 sm:pl-2 lg:ml-2">
                  Showing <strong className="text-foreground">{filtered.length}</strong> of {messages.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Main View: Full Message Response Workspace OR Grid Feed ── */}
      {selectedMessage ? (
        <SuperadminCaseWorkspace
          key={selectedMessage.id}
          message={selectedMessage}
          onBack={() => handleSelectMessage(null)}
          onRefresh={onRefresh}
          onMessageChange={(patch) =>
            setSelectedMessage((prev) => (prev ? { ...prev, ...patch } : prev))
          }
        />
      ) : (
        /* ─── All Reports Grid Feed ────────────────────────────────── */
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-muted/40 animate-pulse border border-border" />
            ))
          ) : filtered.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <Card className="p-12 text-center text-muted-foreground text-xs rounded-2xl border-dashed">
                <Shield className="size-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="font-bold text-foreground">No reports match your filters</p>
                <p className="mt-1 text-[11px]">Try clearing search keywords or changing category filters.</p>
              </Card>
            </div>
          ) : (
            filtered.map((msg) => {
              const isHarassment = msg.type === "harassment"
              const isGirlSafety = msg.type === "girl_safety"
              const revealIdentity = !msg.anonymous || isHarassment
              const senderInitials = revealIdentity
                ? (msg.senderEmail || "ST").slice(0, 2).toUpperCase()
                : "AN"

              return (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-4 transition-all duration-200 cursor-pointer text-xs shadow-xs hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
                >
                  {/* Left Accent Bar */}
                  <span
                    className={cn(
                      "absolute inset-y-0 left-0 w-1",
                      isHarassment ? "bg-rose-500" : isGirlSafety ? "bg-pink-500" : "bg-indigo-500"
                    )}
                  />

                  <div className="space-y-3 pl-1.5">
                    {/* Top Row: Type, Status, Case ID */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase",
                            isHarassment
                              ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                              : isGirlSafety
                              ? "bg-pink-500/15 text-pink-700 dark:text-pink-300"
                              : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300"
                          )}
                        >
                          {isHarassment ? (
                            <ShieldAlert className="size-2.5" />
                          ) : isGirlSafety ? (
                            <Shield className="size-2.5" />
                          ) : (
                            <BookOpen className="size-2.5" />
                          )}
                          <span>{msg.type.replace("_", " ")}</span>
                        </span>
                        <StatusBadge status={msg.status} />
                      </div>

                      <span className="font-mono text-[10px] text-muted-foreground font-semibold">
                        #{msg.id.slice(0, 6).toUpperCase()}
                      </span>
                    </div>

                    {/* Sender Strip */}
                    <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 p-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-[10px]">
                        {senderInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-foreground text-xs leading-tight">
                          {revealIdentity
                            ? msg.senderEmail || "Deleted User"
                            : "Anonymous Student"}
                        </p>
                        {msg.anonymous && isHarassment ? (
                          <span className="text-[9px] text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1 mt-0.5">
                            <Eye className="size-2" />
                            Super Admin only
                          </span>
                        ) : msg.anonymous ? (
                          <span className="text-[9px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 mt-0.5">
                            <EyeOff className="size-2" />
                            Identity protected
                          </span>
                        ) : (
                          <span className="text-[9px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Eye className="size-2 text-emerald-500" />
                            Public Identity
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Body Preview */}
                    <p className="line-clamp-2 text-foreground/90 leading-relaxed text-xs">
                      {msg.content}
                    </p>
                  </div>

                  {/* Card Bottom: Replies & Open Button */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/40 text-[11px] text-muted-foreground pl-1.5">
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground/80">
                      <MessageSquare className="size-3 text-primary" />
                      {msg.replies.length} {msg.replies.length === 1 ? "response" : "responses"}
                    </span>

                    <span className="inline-flex items-center gap-1 font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                      <span>Open & Respond</span>
                      <ArrowRight className="size-3" />
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import {
  MessageSquare,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
} from "lucide-react"

import type { MessageRow } from "@/components/dashboard/messages-table"
import { ReplyThread } from "@/components/ReplyThread"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type ExecutiveMessage = MessageRow & {
  senderEmail?: string | null
  internalNote?: string | null
  replies: Array<{
    id: string
    content: string
    createdAt: string
    senderEmail?: string | null
  }>
}

export type InboxFilter = "all" | "pending" | "in_review" | "resolved"

type ExecutiveInboxPanelProps = {
  messages: ExecutiveMessage[]
  loading: boolean
  filter: InboxFilter
  onFilterChange: (filter: InboxFilter) => void
  onRefresh: () => void
  selectedMessage: ExecutiveMessage | null
  onSelectMessage: (message: ExecutiveMessage | null) => void
  onReply: (messageId: string, content: string) => Promise<void>
  onStatusChange: (messageId: string, status: string) => Promise<void>
  onNoteChange: (messageId: string, note: string) => Promise<void>
}

function formatRelativeTime(iso: string) {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
  } catch {
    return iso
  }
}

export function ExecutiveInboxPanel({
  messages,
  loading,
  filter,
  onFilterChange,
  onRefresh,
  selectedMessage,
  onSelectMessage,
  onReply,
  onStatusChange,
  onNoteChange,
}: ExecutiveInboxPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "feedback">("all")

  // Defensive client-side guard: harassment and anonymous reports are Super Admin only.
  const visibleMessages = useMemo(
    () => messages.filter((m) => m.type !== "harassment" && !m.anonymous),
    [messages]
  )

  // Filtered messages
  const filteredMessages = useMemo(() => {
    let result = visibleMessages

    // Status filter
    if (filter === "pending") {
      result = result.filter((m) => m.status === "pending")
    } else if (filter === "in_review") {
      result = result.filter((m) => m.status === "in_review")
    } else if (filter === "resolved") {
      result = result.filter((m) => m.status === "resolved")
    }

    // Type sub-filter
    if (typeFilter !== "all") {
      result = result.filter((m) => m.type === typeFilter)
    }

    // Search query
    const q = searchQuery.toLowerCase().trim()
    if (q) {
      result = result.filter((m) => {
        const matchesContent = m.content.toLowerCase().includes(q)
        const matchesSender = (m.senderEmail || "").toLowerCase().includes(q)
        const matchesReplies = m.replies.some((r) => r.content.toLowerCase().includes(q))
        return matchesContent || matchesSender || matchesReplies
      })
    }

    return result
  }, [visibleMessages, filter, typeFilter, searchQuery])

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="flex h-full min-h-0 flex-1 overflow-hidden">
        {/* ── LEFT PANE: Message List & Simple Controls ── */}
        <div
          className={cn(
            "flex h-full min-h-0 flex-col overflow-hidden border-r border-border/60 bg-background transition-all",
            selectedMessage
              ? "hidden lg:flex lg:w-[360px] xl:w-[380px] shrink-0"
              : "flex w-full lg:w-[360px] xl:w-[380px] shrink-0"
          )}
        >
          {/* Header & Clean Filter Bar (No duplicate large boxes) */}
          <div className="shrink-0 border-b border-border/50 bg-card/40 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">Inbox</span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  {filteredMessages.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                  onClick={onRefresh}
                  className="size-7 p-0 text-muted-foreground hover:text-foreground"
                  title="Refresh inbox"
                >
                  <RefreshCw className={cn("size-3.5", loading && "animate-spin text-primary")} />
                  <span className="sr-only">Refresh</span>
                </Button>
              </div>
            </div>

            {/* Simple Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="h-8 pl-8 pr-7 text-xs rounded-lg bg-background border-border/70 focus-visible:ring-1 focus-visible:ring-primary/40"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Super Admin-only sensitive report routing notice */}
            <div className="flex items-start gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2.5 py-1.5 text-[10px] font-medium leading-relaxed text-amber-700 dark:text-amber-300">
              <ShieldAlert className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
              <span>Harassment and anonymous reports are hidden from executives and reviewed only by Super Admin.</span>
            </div>

            {/* Clean Status & Type Filter Pills (Compact, Single Source of Truth) */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5 text-xs">
              <div className="flex flex-wrap items-center gap-1">
                {(["all", "pending", "resolved"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onFilterChange(s)}
                    className={cn(
                      "cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors",
                      filter === s
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1 border-l border-border/50 pl-1.5">
                {(["all", "feedback"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeFilter(t)}
                    className={cn(
                      "cursor-pointer rounded px-2 py-0.5 text-[10px] font-medium capitalize transition-colors",
                      typeFilter === t
                        ? "bg-muted font-bold text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t === "all" ? "All" : t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-border/30 scrollbar-none">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">No identified feedback found</p>
                <p className="text-[11px]">Harassment and anonymous reports are Super Admin only.</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id
                const senderDisplay = msg.anonymous
                  ? "Anonymous Student"
                  : msg.senderEmail || "Student"

                return (
                  <button
                    key={msg.id}
                    type="button"
                    onClick={() => onSelectMessage(msg)}
                    className={cn(
                      "w-full text-left p-3 transition-colors flex flex-col gap-1.5 cursor-pointer",
                      isSelected
                        ? "bg-primary/10 border-l-3 border-l-primary"
                        : "hover:bg-muted/40 border-l-3 border-l-transparent"
                    )}
                  >
                    <div className="flex items-center justify-between gap-1 text-[11px]">
                      <span className="font-bold text-foreground truncate max-w-[190px]">
                        {senderDisplay}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatRelativeTime(msg.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.2 text-[9px] font-bold uppercase",
                          msg.type === "harassment"
                            ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                            : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300"
                        )}
                      >
                        {msg.type}
                      </span>
                      <StatusBadge status={msg.status} />
                    </div>

                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed mt-0.5">
                      {msg.content}
                    </p>

                    {msg.replies.length > 0 && (
                      <span className="text-[10px] text-primary font-semibold mt-0.5">
                        {msg.replies.length} {msg.replies.length === 1 ? "reply" : "replies"}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ── RIGHT PANE: Selected Conversation / Desktop Empty State ── */}
        <div
          className={cn(
            "flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background",
            selectedMessage ? "flex" : "hidden lg:flex"
          )}
        >
          {selectedMessage ? (
            <ReplyThread
              message={selectedMessage}
              onClose={() => onSelectMessage(null)}
              onReply={onReply}
              onStatusChange={onStatusChange}
              onNoteChange={onNoteChange}
              showCloseButton={true}
            />
          ) : (
            <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center p-6 text-center bg-card/5">
              <div className="my-auto w-full max-w-sm space-y-3">
                <div className="size-12 mx-auto rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                  <MessageSquare className="size-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-foreground">Select a report</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Choose a student submission from the inbox to read details and send a reply.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

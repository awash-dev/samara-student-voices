"use client"

import { ChevronRight, Inbox, MessageSquare } from "lucide-react"

import { MessageTypeChip } from "@/components/dashboard/message-type-chip"
import type { MessageRow } from "@/components/dashboard/messages-table"
import { StatusBadge } from "@/components/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

type ExecutiveMessagesListProps = {
  messages: MessageRow[]
  loading?: boolean
  selectedId?: string | null
  onSelect: (message: MessageRow) => void
  emptyTitle?: string
  emptyDescription?: string
}

export function ExecutiveMessagesList({
  messages,
  loading = false,
  selectedId,
  onSelect,
  emptyTitle = "No messages",
  emptyDescription,
}: ExecutiveMessagesListProps) {
  if (loading) {
    return (
      <div className="dashboard-panel-elevated flex h-full min-h-0 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border/60 bg-muted/30 px-4 py-3">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="dashboard-panel-elevated flex h-full min-h-0 flex-col items-center justify-center px-6 py-14 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Inbox className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-4 text-base font-semibold">{emptyTitle}</p>
        {emptyDescription ? (
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {emptyDescription}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="dashboard-panel-elevated flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MessageSquare className="size-4 text-primary" aria-hidden="true" />
          {messages.length} {messages.length === 1 ? "message" : "messages"}
        </div>
        <p className="text-xs text-muted-foreground">Tap to open & reply</p>
      </div>

      <ul className="min-h-0 flex-1 divide-y divide-border/50 overflow-y-auto overscroll-contain">
        {messages.map((msg) => {
          const selected = selectedId === msg.id
          return (
            <li key={msg.id}>
              <button
                type="button"
                onClick={() => onSelect(msg)}
                className={cn(
                  "flex w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50",
                  selected && "bg-primary/5"
                )}
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <MessageTypeChip type={msg.type} />
                    <StatusBadge status={msg.status} />
                    {msg.replies.length > 0 ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {msg.replies.length}{" "}
                        {msg.replies.length === 1 ? "reply" : "replies"}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {msg.anonymous ? (
                      <Badge variant="outline" className="mr-1 text-xxs">
                        Anonymous
                      </Badge>
                    ) : (
                      <span className="break-all">{msg.senderEmail || "Student"}</span>
                    )}
                    <span className="mx-1">·</span>
                    {formatDate(msg.createdAt)}
                  </p>
                  <p className="line-clamp-2 text-sm leading-relaxed text-foreground">
                    {msg.content}
                  </p>
                </div>
                <ChevronRight
                  className={cn(
                    "mt-1 size-5 shrink-0 text-muted-foreground",
                    selected && "text-primary"
                  )}
                  aria-hidden="true"
                />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

"use client"

import { ChevronRight, Inbox, MessageSquare } from "lucide-react"

import { MessageTypeChip } from "@/components/dashboard/message-type-chip"
import { StatusBadge } from "@/components/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type MessageRow = {
  id: string
  type: "harassment" | "feedback"
  content: string
  anonymous: boolean
  status: "pending" | "in_review" | "resolved"
  createdAt: string
  senderEmail?: string | null
  replies: Array<{ id: string; content: string; createdAt: string }>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

type MessagesTableProps = {
  messages: MessageRow[]
  loading?: boolean
  variant: "student" | "executive"
  /** Sticky header + scrollable body (executive inbox list pane) */
  scrollable?: boolean
  selectedId?: string | null
  onSelect?: (message: MessageRow) => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  className?: string
}

export function MessagesTable({
  messages,
  loading = false,
  variant,
  scrollable = false,
  selectedId,
  onSelect,
  emptyTitle = "No messages",
  emptyDescription,
  emptyAction,
  className,
}: MessagesTableProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "dashboard-panel-elevated overflow-hidden p-4",
          scrollable && "flex h-full min-h-0 flex-col",
          className
        )}
      >
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div
        className={cn(
          "dashboard-panel-elevated flex flex-col items-center px-6 py-14 text-center",
          scrollable && "h-full min-h-0 justify-center",
          className
        )}
      >
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Inbox className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-4 text-base font-semibold">{emptyTitle}</p>
        {emptyDescription ? (
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {emptyDescription}
          </p>
        ) : null}
        {emptyAction ? <div className="mt-6">{emptyAction}</div> : null}
      </div>
    )
  }

  const countLabel = (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MessageSquare className="size-4 text-primary" aria-hidden="true" />
        {messages.length} {messages.length === 1 ? "message" : "messages"}
      </div>
      <p className="text-xs text-muted-foreground sm:hidden">Tap to open</p>
    </div>
  )

  const mobileContent = (
    <div
      className={cn(
        "sm:hidden",
        scrollable && "min-h-0 flex-1 overflow-y-auto overscroll-contain"
      )}
    >
      <ul className="divide-y divide-border/40">
        {messages.map((msg, index) => {
          const selected = selectedId === msg.id
          const interactive = Boolean(onSelect)
          const cardContent = (
            <>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <MessageTypeChip type={msg.type} />
                  <StatusBadge status={msg.status} />
                  {variant === "executive" ? (
                    msg.anonymous ? (
                      <Badge
                        variant="outline"
                        className="rounded-full text-xxs font-normal"
                      >
                        Anonymous
                      </Badge>
                    ) : (
                      <span className="max-w-[160px] truncate text-xs font-medium text-muted-foreground">
                        {msg.senderEmail || "Student"}
                      </span>
                    )
                  ) : null}
                </div>

                <p className="line-clamp-2 text-sm leading-snug text-foreground/90">
                  {msg.content}
                </p>

                <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <span>{formatDate(msg.createdAt)}</span>
                  <span
                    className={cn(
                      "inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                      msg.replies.length > 0
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {msg.replies.length}{" "}
                    {msg.replies.length === 1 ? "reply" : "replies"}
                  </span>
                </div>
              </div>
              {interactive ? (
                <ChevronRight
                  className="mt-1 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              ) : null}
            </>
          )

          return (
            <li
              key={msg.id}
              className={cn(
                index % 2 === 0 ? "bg-card" : "bg-muted/15",
                selected && "bg-primary/5"
              )}
            >
              {interactive ? (
                <button
                  type="button"
                  onClick={() => onSelect?.(msg)}
                  className="flex w-full items-start gap-3 p-4 text-left transition-colors active:bg-muted/80"
                  aria-label={`View ${msg.type} message`}
                >
                  {cardContent}
                </button>
              ) : (
                <div className="flex items-start gap-3 p-4">{cardContent}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )

  const tableContent = (
    <div
      className={cn(
        "hidden sm:block",
        scrollable ? "min-h-0 flex-1 overflow-y-auto overflow-x-auto overscroll-contain" : "overflow-x-auto"
      )}
    >
        <Table className={cn("min-w-[640px]", scrollable && "min-w-full lg:min-w-0")}>
          <TableHeader>
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="h-11 bg-muted/20 font-semibold">Type</TableHead>
              {variant === "executive" ? (
                <TableHead className="min-w-[100px] bg-muted/20 font-semibold">
                  From
                </TableHead>
              ) : null}
              <TableHead className="min-w-[140px] bg-muted/20 font-semibold">
                Message
              </TableHead>
              <TableHead className="bg-muted/20 font-semibold">Status</TableHead>
              <TableHead className="hidden bg-muted/20 font-semibold sm:table-cell">
                Date
              </TableHead>
              <TableHead className="bg-muted/20 text-right font-semibold">
                Replies
              </TableHead>
              <TableHead className="w-12 bg-muted/20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((msg, index) => {
              const selected = selectedId === msg.id
              return (
                <TableRow
                  key={msg.id}
                  data-state={selected ? "selected" : undefined}
                  className={cn(
                    "border-border/40 transition-colors",
                    onSelect && "cursor-pointer active:bg-muted/80",
                    selected
                      ? "bg-primary/5 hover:bg-primary/8"
                      : index % 2 === 0
                        ? "bg-card hover:bg-muted/40"
                        : "bg-muted/15 hover:bg-muted/40"
                  )}
                  onClick={onSelect ? () => onSelect(msg) : undefined}
                >
                  <TableCell className="py-3.5">
                    <MessageTypeChip type={msg.type} />
                  </TableCell>
                  {variant === "executive" ? (
                    <TableCell className="max-w-[120px] py-3.5">
                      {msg.anonymous ? (
                        <Badge
                          variant="outline"
                          className="rounded-full text-xxs font-normal"
                        >
                          Anonymous
                        </Badge>
                      ) : (
                        <span className="truncate text-sm font-medium">
                          {msg.senderEmail || "Student"}
                        </span>
                      )}
                    </TableCell>
                  ) : null}
                  <TableCell className="max-w-[220px] py-3.5">
                    <p className="line-clamp-2 text-sm leading-snug text-foreground/90">
                      {msg.content}
                    </p>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <StatusBadge status={msg.status} />
                  </TableCell>
                  <TableCell className="hidden py-3.5 text-xs font-medium text-muted-foreground sm:table-cell">
                    {formatDate(msg.createdAt)}
                  </TableCell>
                  <TableCell className="py-3.5 text-right">
                    <span
                      className={cn(
                        "inline-flex min-w-7 justify-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                        msg.replies.length > 0
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {msg.replies.length}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 text-right">
                    {onSelect ? (
                      <Button
                        type="button"
                        variant={selected ? "default" : "ghost"}
                        size="icon-sm"
                        className="size-8 rounded-full"
                        aria-label="View message"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelect(msg)
                        }}
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
    </div>
  )

  return (
    <div
      className={cn(
        "dashboard-panel-elevated overflow-hidden",
        scrollable && "flex h-full min-h-0 flex-col",
        className
      )}
    >
      {countLabel}
      {mobileContent}
      {tableContent}
    </div>
  )
}

import { AlertTriangle, BookOpen, Clock, MessageSquare } from "lucide-react"

import { StatusBadge } from "@/components/StatusBadge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

type Reply = {
  id: string
  content: string
  createdAt: string
}

type MessageCardProps = {
  type: "harassment" | "feedback"
  content: string
  anonymous: boolean
  status: "pending" | "in_review" | "resolved"
  createdAt: string
  replies?: Reply[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function MessageCard({
  type,
  content,
  anonymous,
  status,
  createdAt,
  replies = [],
}: MessageCardProps) {
  const isHarassment = type === "harassment"

  return (
    <Card
      className={
        isHarassment
          ? "border-destructive/30 shadow-sm shadow-destructive/5"
          : "border-primary/20 shadow-sm shadow-primary/5"
      }
    >
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex items-start gap-3">
          <div
            className={
              isHarassment
                ? "flex size-9 items-center justify-center rounded-lg bg-destructive/10"
                : "flex size-9 items-center justify-center rounded-lg bg-primary/10"
            }
          >
            {isHarassment ? (
              <AlertTriangle className="size-4 text-destructive" aria-hidden="true" />
            ) : (
              <BookOpen className="size-4 text-primary" aria-hidden="true" />
            )}
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">
              {isHarassment ? "Harassment report" : "Feedback"}
            </CardTitle>
            <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" aria-hidden="true" />
                {formatDate(createdAt)}
              </span>
              {anonymous ? (
                <Badge variant="outline" className="text-xs">
                  Anonymous
                </Badge>
              ) : null}
            </CardDescription>
          </div>
        </div>
        <StatusBadge status={status} />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-foreground">{content}</p>
        {replies.length > 0 ? (
          <>
            <Separator />
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <MessageSquare className="size-3.5" aria-hidden="true" />
                Replies ({replies.length})
              </p>
              {replies.map((reply) => (
                <div
                  key={reply.id}
                  className="rounded-lg border border-border bg-muted/40 px-4 py-3"
                >
                  <p className="text-sm">{reply.content}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDate(reply.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}

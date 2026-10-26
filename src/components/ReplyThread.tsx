"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  Loader2,
  Lock,
  MessageSquare,
  Send,
  ShieldAlert,
  Sparkles,
  User,
  UserX,
} from "lucide-react"

import { MessageTypeChip } from "@/components/dashboard/message-type-chip"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type Reply = {
  id: string
  content: string
  createdAt: string
  senderEmail?: string | null
}

export type Message = {
  id: string
  type: "harassment" | "feedback"
  content: string
  anonymous: boolean
  status: "pending" | "in_review" | "resolved"
  createdAt: string
  senderEmail?: string | null
  internalNote?: string | null
  replies: Reply[]
}

type ReplyThreadProps = {
  message: Message
  onClose?: () => void
  onReply: (messageId: string, content: string) => Promise<void>
  onStatusChange: (messageId: string, status: string) => Promise<void>
  onNoteChange: (messageId: string, note: string) => Promise<void>
  showCloseButton?: boolean
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

const QUICK_TEMPLATES = [
  {
    label: "Under review",
    text: "Thank you for reaching out. We have received your submission and our executive team is actively reviewing the matter.",
  },
  {
    label: "More details needed",
    text: "Thank you for contacting us. Could you please provide additional details or specific context so we can take immediate action?",
  },
  {
    label: "Issue resolved",
    text: "Thank you for bringing this to our attention. This matter has been reviewed and appropriate measures have been taken.",
  },
]

export function ReplyThread({
  message,
  onClose,
  onReply,
  onStatusChange,
  onNoteChange,
  showCloseButton = true,
}: ReplyThreadProps) {
  const [replyContent, setReplyContent] = useState("")
  const [noteContent, setNoteContent] = useState(message.internalNote || "")
  const [showNoteField, setShowNoteField] = useState(Boolean(message.internalNote))
  const [sending, setSending] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setNoteContent(message.internalNote || "")
    setShowNoteField(Boolean(message.internalNote))
  }, [message.id, message.internalNote])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [message.replies.length])

  const handleSendReply = async () => {
    if (!replyContent.trim() || sending) return
    setSending(true)
    try {
      await onReply(message.id, replyContent.trim())
      setReplyContent("")
    } finally {
      setSending(false)
    }
  }

  const handleStatusClick = async (newStatus: "pending" | "in_review" | "resolved") => {
    if (message.status === newStatus || statusUpdating) return
    setStatusUpdating(newStatus)
    try {
      await onStatusChange(message.id, newStatus)
    } finally {
      setStatusUpdating(null)
    }
  }

  const handleSaveNote = async () => {
    setSavingNote(true)
    try {
      await onNoteChange(message.id, noteContent)
    } finally {
      setSavingNote(false)
    }
  }

  const handleCopyEmail = () => {
    if (!message.senderEmail) return
    void navigator.clipboard.writeText(message.senderEmail)
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  const applyTemplate = (tplText: string) => {
    setReplyContent((prev) => (prev ? `${prev}\n\n${tplText}` : tplText))
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const senderLabel = message.anonymous
    ? "Anonymous Student"
    : message.senderEmail || "Student"

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background">
      {/* ── Single Clean Header Bar ── */}
      <header className="flex shrink-0 flex-col gap-2 border-b border-border/50 bg-card/40 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          {onClose && showCloseButton && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden h-8 shrink-0 px-2 text-xs font-semibold"
            >
              <ArrowLeft className="size-3.5 mr-1" />
              Back
            </Button>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="max-w-full truncate text-sm font-bold text-foreground">
                {senderLabel}
              </span>
              {!message.anonymous && message.senderEmail && (
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                  title="Copy email"
                >
                  {copiedEmail ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                </button>
              )}
              <MessageTypeChip type={message.type} />
            </div>
            <p className="truncate text-[11px] text-muted-foreground">
              {formatDate(message.createdAt)}
            </p>
          </div>
        </div>

        {/* Status Switcher in Header */}
        <div className="flex max-w-full items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none sm:shrink-0 sm:pb-0">
          <span className="mr-1 hidden shrink-0 text-[11px] font-medium text-muted-foreground sm:inline">Status:</span>
          {(["pending", "in_review", "resolved"] as const).map((s) => (
            <button
              key={s}
              type="button"
              disabled={statusUpdating !== null}
              onClick={() => handleStatusClick(s)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-semibold capitalize transition-all cursor-pointer sm:px-2.5 sm:text-xs",
                message.status === s
                  ? s === "pending"
                    ? "bg-amber-500 text-white border-amber-600"
                    : s === "in_review"
                    ? "bg-blue-600 text-white border-blue-700"
                    : "bg-emerald-600 text-white border-emerald-700"
                  : "border-border/60 bg-background text-muted-foreground hover:bg-muted"
              )}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </header>

      {/* ── Conversation Stream ── */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-none">
        <div className="max-w-2xl mx-auto space-y-4">
          {message.type === "harassment" && (
            <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs">
              <strong>Confidential Safety Report:</strong> Handle this case with discretion.
            </div>
          )}

          {/* Student Original Message */}
          <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-2 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-muted-foreground">
              <span className="min-w-0 break-words font-bold text-foreground">{senderLabel}</span>
              <span className="shrink-0">{formatDate(message.createdAt)}</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {message.content}
            </p>
          </div>

          {/* Executive Replies */}
          {message.replies.map((reply, index) => (
            <div
              key={reply.id || `reply-${index}`}
              className="ml-2 space-y-1.5 rounded-xl border border-primary/25 bg-primary/5 p-3.5 sm:ml-8 sm:p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-muted-foreground">
                <span className="min-w-0 break-words font-bold text-primary">
                  {reply.senderEmail || "Executive Committee"}
                </span>
                <span className="shrink-0">{formatDate(reply.createdAt)}</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {reply.content}
              </p>
            </div>
          ))}

          {message.replies.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-2 italic">
              No replies sent yet. Use the composer below to respond.
            </p>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Bottom Response Composer ── */}
      <footer className="shrink-0 border-t border-border/50 bg-card/30 p-3 sm:p-4 space-y-2.5">
        <div className="max-w-2xl mx-auto space-y-2.5">
          {/* Quick Insert Templates & Note Toggle */}
          <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] font-medium text-muted-foreground">Templates:</span>
              {QUICK_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => applyTemplate(tpl.text)}
                  className="cursor-pointer rounded border border-border/60 bg-background px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:py-0.5"
                >
                  {tpl.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowNoteField(!showNoteField)}
              className="flex shrink-0 cursor-pointer items-center gap-1 self-start text-[11px] font-semibold text-muted-foreground hover:text-foreground sm:self-auto"
            >
              <Lock className="size-3" />
              <span>{showNoteField ? "Hide Note" : "+ Note"}</span>
              {message.internalNote && <span className="size-1.5 rounded-full bg-emerald-500" />}
            </button>
          </div>

          {/* Internal Note (Conditional) */}
          {showNoteField && (
            <div className="space-y-2 rounded-lg border border-border/70 bg-muted/30 p-2.5">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Internal Investigation Note</span>
                <button
                  type="button"
                  disabled={savingNote}
                  onClick={handleSaveNote}
                  className="cursor-pointer text-xs font-bold text-primary hover:underline"
                >
                  {savingNote ? "Saving..." : "Save Note"}
                </button>
              </div>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Private note for executive team..."
                rows={2}
                className="w-full text-xs bg-background p-2 rounded-md border border-border/60 focus:outline-none resize-none"
              />
            </div>
          )}

          {/* Reply Textarea & Submit */}
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault()
                  void handleSendReply()
                }
              }}
              rows={3}
              placeholder="Type your response to the student... (Ctrl + Enter to send)"
              className="w-full text-xs rounded-xl border border-border bg-background p-3 focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none shadow-xs"
            />

            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                Student will see this reply on their dashboard.
              </span>
              <Button
                type="button"
                size="sm"
                disabled={sending || !replyContent.trim()}
                onClick={handleSendReply}
                className="ml-auto text-xs h-8 px-4 font-bold"
              >
                {sending ? <Loader2 className="size-3 animate-spin mr-1" /> : <Send className="size-3 mr-1" />}
                Send Reply
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

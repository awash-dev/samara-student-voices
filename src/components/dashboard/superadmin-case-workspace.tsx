"use client"

import { useState, type ReactNode } from "react"
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  MessageSquare,
  Save,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  type LucideIcon,
} from "lucide-react"

import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { exportCaseAsWord } from "@/lib/export/case-word"
import type {
  SuperadminMessage,
  SuperadminMessageReply,
} from "@/lib/messages/types"
import { cn } from "@/lib/utils"

type CaseWorkspaceProps = {
  message: SuperadminMessage
  onBack: () => void
  onRefresh: () => void
  onMessageChange: (patch: Partial<SuperadminMessage>) => void
}

type TypeMeta = {
  label: string
  badgeClass: string
  icon: LucideIcon
}

const QUICK_TEMPLATES = [
  {
    label: "Under Investigation",
    text: "We have received your report. The Executive Committee and Campus Safety are actively investigating this case.",
  },
  {
    label: "Girl Safety Routing",
    text: "Your report has been prioritized and assigned to the designated Female Student Safety Liaison for immediate confidential handling.",
  },
  {
    label: "Request Details",
    text: "Thank you for reaching out. Could you please provide any additional details, exact dormitory block, or times to assist the investigation?",
  },
  {
    label: "Case Resolved",
    text: "This case has been reviewed and necessary actions have been taken. Thank you for speaking up and keeping our campus safe.",
  },
]

const TYPE_META: Record<string, TypeMeta> = {
  harassment: {
    label: "Harassment",
    badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    icon: ShieldAlert,
  },
  girl_safety: {
    label: "Girl safety",
    badgeClass: "bg-pink-500/15 text-pink-700 dark:text-pink-300",
    icon: Shield,
  },
  feedback: {
    label: "Feedback",
    badgeClass: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
    icon: BookOpen,
  },
}

function humanize(value: string): string {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase())
}

function typeMeta(type: string): TypeMeta {
  return (
    TYPE_META[type] ?? {
      label: humanize(type),
      badgeClass: "bg-muted text-muted-foreground",
      icon: BookOpen,
    }
  )
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown time"
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function SummaryTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: ReactNode
}) {
  return (
    <div className="min-w-0 bg-card px-3 py-2.5 sm:px-4">
      <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3 shrink-0" />
        <span className="truncate">{label}</span>
      </p>
      <div className="mt-1 break-words text-[11px] font-bold leading-snug text-foreground">
        {value}
      </div>
    </div>
  )
}

export function SuperadminCaseWorkspace({
  message,
  onBack,
  onRefresh,
  onMessageChange,
}: CaseWorkspaceProps) {
  const [replyInput, setReplyInput] = useState("")
  const [internalNoteInput, setInternalNoteInput] = useState(message.internalNote || "")
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [sendingReply, setSendingReply] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const meta = typeMeta(message.type)
  const TypeIcon = meta.icon
  const shortCaseId = message.id.slice(0, 8).toUpperCase()
  const isHarassment = message.type === "harassment"
  // Super Admin sees harassment reporter identity for safety review, even when
  // the student chose anonymous. All other anonymous reports stay masked.
  const revealIdentity = !message.anonymous || isHarassment

  const showSuccess = (text: string) => {
    setActionError(null)
    setActionSuccess(text)
    window.setTimeout(() => setActionSuccess(null), 3500)
  }

  const showError = (text: string) => {
    setActionSuccess(null)
    setActionError(text)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(text)
      window.setTimeout(() => setCopiedId(null), 2000)
    } catch {
      showError("Could not copy the case ID. Select it manually instead.")
    }
  }

  const handleStatusChange = async (newStatus: SuperadminMessage["status"]) => {
    if (updatingStatus || newStatus === message.status) return
    setUpdatingStatus(true)
    setActionError(null)
    try {
      const res = await fetch(`/api/messages/${message.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          internalNote: internalNoteInput || message.internalNote || "",
        }),
      })

      if (!res.ok) {
        throw new Error("Status update failed")
      }

      onMessageChange({
        status: newStatus,
        internalNote: internalNoteInput || message.internalNote,
      })
      showSuccess(`Status changed to ${humanize(newStatus)}`)
      onRefresh()
    } catch {
      showError("Could not update the case status. Please try again.")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleSaveInternalNote = async () => {
    if (savingNote) return
    setSavingNote(true)
    setActionError(null)
    try {
      const res = await fetch(`/api/messages/${message.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: message.status,
          internalNote: internalNoteInput,
        }),
      })

      if (!res.ok) {
        throw new Error("Note update failed")
      }

      onMessageChange({ internalNote: internalNoteInput })
      showSuccess("Internal investigation note saved")
      onRefresh()
    } catch {
      showError("Could not save the internal note. Please try again.")
    } finally {
      setSavingNote(false)
    }
  }

  const handleSendReply = async (andResolve = false) => {
    const content = replyInput.trim()
    if (!content || sendingReply) return

    setSendingReply(true)
    setActionError(null)
    try {
      const res = await fetch("/api/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: message.id,
          message_id: message.id,
          content,
        }),
      })

      if (!res.ok) {
        throw new Error("Reply failed")
      }

      const newReply = (await res.json()) as {
        id?: string
        reply_id?: string
        createdAt?: string
      }

      const formattedReply: SuperadminMessageReply = {
        id: newReply.id || newReply.reply_id || `reply-${Date.now()}`,
        messageId: message.id,
        fromUserId: null,
        senderEmail: "Super Admin",
        senderName: "Super Admin Compliance",
        content,
        createdAt: newReply.createdAt || new Date().toISOString(),
      }

      // The reply endpoint moves the case to "in review" automatically.
      let nextStatus: SuperadminMessage["status"] = "in_review"
      let resolveFailed = false

      if (andResolve) {
        const statusRes = await fetch(`/api/messages/${message.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "resolved",
            internalNote: internalNoteInput || message.internalNote || "",
          }),
        })

        if (statusRes.ok) {
          nextStatus = "resolved"
        } else {
          resolveFailed = true
        }
      }

      onMessageChange({
        status: nextStatus,
        replies: [...message.replies, formattedReply],
      })
      setReplyInput("")
      onRefresh()

      if (resolveFailed) {
        showError("Reply sent, but the case could not be marked as resolved.")
      } else {
        showSuccess(
          andResolve
            ? "Response sent and case marked as RESOLVED"
            : "Response sent to the student thread successfully"
        )
      }
    } catch {
      showError("Could not send the reply. Please try again.")
    } finally {
      setSendingReply(false)
    }
  }

  const handleExportWord = () => {
    try {
      const filename = exportCaseAsWord(message)
      showSuccess(`Word document downloaded: ${filename}`)
    } catch {
      showError("Could not create the Word document. Please try again.")
    }
  }

  return (
    <div className="min-w-0 space-y-4 animate-in fade-in duration-200">
      {/* Case header, actions, and responsive snapshot */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
        <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground shadow-xs transition-all hover:bg-muted"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to All Reports</span>
            </button>

            <span className="max-w-full truncate rounded-xl bg-primary/10 px-3 py-1.5 font-mono text-[11px] font-extrabold text-primary sm:text-xs">
              CASE #{shortCaseId}
            </span>

            <StatusBadge status={message.status} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void copyToClipboard(message.id)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-border bg-background px-2.5 py-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              title="Copy full case UUID"
            >
              {copiedId === message.id ? (
                <>
                  <Check className="size-3 text-emerald-500" />
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  <span>Copy ID</span>
                </>
              )}
            </button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleExportWord}
              className="h-8 cursor-pointer rounded-xl px-3 text-[11px] font-bold"
              title="Download a clean Word document of this case"
            >
              <Download className="size-3.5" />
              Export Word
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px border-t border-border/70 bg-border/60 sm:grid-cols-4">
          <SummaryTile icon={TypeIcon} label="Category" value={meta.label} />
          <SummaryTile
            icon={Calendar}
            label="Submitted"
            value={formatDateTime(message.createdAt)}
          />
          <SummaryTile
            icon={MessageSquare}
            label="Conversation"
            value={`${message.replies.length} ${
              message.replies.length === 1 ? "reply" : "replies"
            }`}
          />
          <SummaryTile
            icon={revealIdentity ? Eye : EyeOff}
            label="Reporter"
            value={
              message.anonymous && isHarassment
                ? "Super Admin only"
                : message.anonymous
                  ? "Anonymous"
                  : "Identified"
            }
          />
        </div>
      </div>

      {actionSuccess ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-700 animate-in fade-in dark:text-emerald-300"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
          <span>{actionSuccess}</span>
        </div>
      ) : null}

      {actionError ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-700 animate-in fade-in dark:text-rose-300"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-500" />
          <span>{actionError}</span>
        </div>
      ) : null}

      <div className="grid min-w-0 gap-4 lg:grid-cols-12 lg:items-start">
        {/* Original submission */}
        <Card className="order-1 min-w-0 gap-0 rounded-2xl border-border/80 bg-card py-0 shadow-sm lg:col-span-8">
          <CardHeader className="border-b border-border/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-1.5 text-sm font-extrabold">
                  <FileText className="size-4 text-primary" />
                  Original report
                </CardTitle>
                <CardDescription className="mt-1 text-[11px]">
                  Submitted by the student on {formatDateTime(message.createdAt)}
                </CardDescription>
              </div>

              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase",
                  meta.badgeClass
                )}
              >
                <TypeIcon className="size-2.5" />
                {meta.label}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="whitespace-pre-wrap break-words rounded-xl border border-border/70 bg-muted/20 p-3.5 text-xs leading-relaxed text-foreground sm:p-4 sm:text-[13px]">
              {message.content}
            </div>
          </CardContent>
        </Card>

        {/* Reporter identity */}
        <Card className="order-2 min-w-0 gap-0 rounded-2xl border-border/80 bg-card py-0 shadow-sm lg:col-span-4">
          <CardHeader className="border-b border-border/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <CardTitle className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider">
                <User className="size-3.5 text-primary" />
                Reporter identity
              </CardTitle>
              {message.anonymous && isHarassment ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300">
                  <Eye className="size-2.5" />
                  Super Admin only
                </span>
              ) : message.anonymous ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[9px] font-bold text-rose-600 dark:text-rose-400">
                  <EyeOff className="size-2.5" />
                  Protected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                  <Eye className="size-2.5" />
                  Identified
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 p-4">
            {revealIdentity ? (
              <>
                {message.anonymous && isHarassment ? (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 dark:text-amber-200">
                      <ShieldCheck className="size-3.5 shrink-0" />
                      Anonymous to students and executives
                    </p>
                    <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                      The student chose anonymous submission. This identity is visible only
                      to Super Admin for safety review and is included in the Super Admin
                      Word export.
                    </p>
                  </div>
                ) : null}
                <dl className="space-y-2">
                  <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                    <dt className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      Student email
                    </dt>
                    <dd className="mt-0.5 break-all font-mono text-[11px] font-bold text-foreground">
                      {message.senderEmail || "Account missing"}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                    <dt className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      Student name
                    </dt>
                    <dd className="mt-0.5 break-words text-[11px] font-bold text-foreground">
                      {message.senderName || "Not provided"}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                    <dt className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      Account UUID
                    </dt>
                    <dd className="mt-0.5 break-all font-mono text-[10px] text-muted-foreground">
                      {message.fromUserId || "None"}
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1.5 rounded-xl border border-rose-500/25 bg-rose-500/10 p-5 text-center">
                <EyeOff className="size-5 text-rose-600 dark:text-rose-400" />
                <p className="text-xs font-bold text-foreground">Identity withheld</p>
                <p className="max-w-xs text-[11px] leading-relaxed text-muted-foreground">
                  This feedback was submitted anonymously. The student&apos;s name, email,
                  and account ID are not exposed here or in the Word export.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Case management */}
        <Card className="order-3 min-w-0 gap-0 rounded-2xl border-border/80 bg-card py-0 shadow-sm lg:order-4 lg:col-span-4">
          <CardHeader className="border-b border-border/60 p-4">
            <CardTitle className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider">
              <ShieldCheck className="size-3.5 text-primary" />
              Case management
            </CardTitle>
            <CardDescription className="text-[11px]">
              Update the case status and keep private investigation notes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Status
                </p>
                {updatingStatus ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
                    <Loader2 className="size-2.5 animate-spin" />
                    Updating
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { value: "pending", label: "Pending", activeClass: "bg-amber-500 text-white border-amber-600" },
                    { value: "in_review", label: "In Review", activeClass: "bg-blue-600 text-white border-blue-700" },
                    { value: "resolved", label: "Resolved", activeClass: "bg-emerald-600 text-white border-emerald-700" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    disabled={updatingStatus}
                    aria-pressed={message.status === item.value}
                    onClick={() => void handleStatusChange(item.value)}
                    className={cn(
                      "h-9 cursor-pointer rounded-xl border text-[10px] font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60",
                      message.status === item.value
                        ? `${item.activeClass} shadow-xs`
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-border/60 pt-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="case-internal-note"
                  className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Internal note
                </label>
                <button
                  type="button"
                  disabled={savingNote}
                  onClick={() => void handleSaveInternalNote()}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[10px] font-bold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingNote ? (
                    <Loader2 className="size-2.5 animate-spin" />
                  ) : (
                    <Save className="size-2.5" />
                  )}
                  {savingNote ? "Saving" : "Save note"}
                </button>
              </div>

              <textarea
                id="case-internal-note"
                rows={4}
                value={internalNoteInput}
                onChange={(event) => setInternalNoteInput(event.target.value)}
                placeholder="Add private investigation notes, officer notes, or next steps..."
                className="w-full resize-y rounded-xl border border-border bg-background p-2.5 text-xs leading-relaxed text-foreground shadow-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
              />

              <p className="text-[10px] leading-relaxed text-muted-foreground">
                Private to Super Admin. Never shown to the student or included in the student
                dashboard.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Conversation */}
        <Card className="order-4 min-w-0 gap-0 rounded-2xl border-border/80 bg-card py-0 shadow-sm lg:order-3 lg:col-span-8">
          <CardHeader className="border-b border-border/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-1.5 text-sm font-extrabold">
                  <MessageSquare className="size-4 text-primary" />
                  Conversation
                </CardTitle>
                <CardDescription className="mt-1 text-[11px]">
                  Replies sent to the student from this case.
                </CardDescription>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                {message.replies.length} {message.replies.length === 1 ? "reply" : "replies"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {message.replies.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 p-8 text-center">
                <MessageSquare className="mx-auto size-7 text-muted-foreground/50" />
                <p className="mt-2 text-xs font-bold text-foreground">No replies yet</p>
                <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-muted-foreground">
                  Choose a template or write a response below. Replies appear on the
                  student&apos;s private dashboard.
                </p>
              </div>
            ) : (
              <div className="max-h-[50dvh] space-y-3 overflow-y-auto overscroll-contain pr-1 lg:max-h-[520px]">
                {message.replies.map((reply) => (
                  <article
                    key={reply.id}
                    className="rounded-xl border border-border/70 bg-muted/20 p-3.5"
                  >
                    <header className="flex flex-wrap items-center justify-between gap-1.5 border-b border-border/50 pb-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <UserCheck className="size-3" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-bold text-foreground">
                            {reply.senderName || reply.senderEmail || "Response team"}
                          </p>
                          <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Case response
                          </p>
                        </div>
                      </div>
                      <time className="font-mono text-[10px] text-muted-foreground">
                        {formatDateTime(reply.createdAt)}
                      </time>
                    </header>
                    <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-foreground">
                      {reply.content}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reply composer */}
        <Card className="order-5 min-w-0 gap-0 rounded-2xl border-border/80 bg-card py-0 shadow-sm lg:col-span-8">
          <CardHeader className="border-b border-border/60 p-4">
            <CardTitle className="flex items-center gap-1.5 text-sm font-extrabold">
              <Send className="size-4 text-primary" />
              Reply to student
            </CardTitle>
            <CardDescription className="text-[11px]">
              Send clear answers or next steps directly to the student dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3.5 p-4">
            <div className="space-y-1.5">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="size-3 text-primary" />
                1-click response templates
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TEMPLATES.map((template) => (
                  <button
                    key={template.label}
                    type="button"
                    onClick={() => setReplyInput(template.text)}
                    className="cursor-pointer rounded-lg border border-border/70 bg-muted/80 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={5}
              value={replyInput}
              onChange={(event) => setReplyInput(event.target.value)}
              onKeyDown={(event) => {
                if (
                  (event.ctrlKey || event.metaKey) &&
                  event.key === "Enter" &&
                  replyInput.trim() &&
                  !sendingReply
                ) {
                  event.preventDefault()
                  void handleSendReply(false)
                }
              }}
              placeholder="Type your response to the student... (Press Ctrl + Enter to send)"
              className="w-full resize-y rounded-xl border border-border bg-background p-3 text-xs leading-relaxed text-foreground shadow-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />

            <div className="flex flex-col gap-2.5 border-t border-border/50 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Clock className="size-3" />
                The student receives this reply on their private dashboard.
              </span>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={sendingReply || !replyInput.trim()}
                  onClick={() => void handleSendReply(true)}
                  className="h-9 w-full cursor-pointer justify-center rounded-xl border-emerald-500/40 px-3.5 text-xs font-bold text-emerald-600 shadow-xs hover:bg-emerald-500/10 dark:text-emerald-400 sm:w-auto"
                  title="Send this response and immediately mark the case as resolved"
                >
                  {sendingReply ? (
                    <Loader2 className="size-3.5 animate-spin text-emerald-500" />
                  ) : (
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                  )}
                  <span>Send &amp; Resolve</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={sendingReply || !replyInput.trim()}
                  onClick={() => void handleSendReply(false)}
                  className="h-9 w-full cursor-pointer justify-center rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-xs sm:w-auto"
                >
                  {sendingReply ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Send className="size-3.5" />
                  )}
                  <span>{sendingReply ? "Sending..." : "Send Reply"}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

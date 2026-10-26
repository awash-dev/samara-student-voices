"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Send,
  Settings,
} from "lucide-react"

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { MessageTypePicker } from "@/components/dashboard/message-type-picker"
import type { MessageRow } from "@/components/dashboard/messages-table"
import { MessagesTable } from "@/components/dashboard/messages-table"
import { StudentMessageSheet } from "@/components/dashboard/student-message-sheet"
import { ToastBanner } from "@/components/dashboard/toast-banner"
import { SignOutButton } from "@/components/SignOutButton"
import { ChangePasswordCard } from "@/components/auth/change-password-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { showBrowserNotification } from "@/lib/browser-notifications"
import { DASHBOARD_COPY } from "@/lib/dashboard/copy"
import { appendUniqueReply, normalizeReplyPayload } from "@/lib/replies"
import type { SessionUser } from "@/lib/session"

const copy = DASHBOARD_COPY.student

type Reply = {
  id: string
  content: string
  createdAt: string
}

type Message = MessageRow & { replies: Reply[] }

type ActiveView = "compose" | "messages" | "reports" | "settings"

export function StudentDashboardClient({ user }: { user: SessionUser }) {
  const [activeView, setActiveView] = useState<ActiveView>("compose")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [messageType, setMessageType] = useState<"harassment" | "feedback">("feedback")
  const [content, setContent] = useState("")
  const [anonymous, setAnonymous] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  )

  const showToast = useCallback((type: "success" | "error", text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/messages")
      if (res.ok) setMessages(await res.json())
      else showToast("error", "Failed to load messages")
    } catch {
      showToast("error", "Failed to load messages")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // Refresh on mount and navigation so realtime reply notifications also work
  // while the student is composing a new message.
  useEffect(() => {
    void fetchMessages()
  }, [activeView, fetchMessages])

  useEffect(() => {
    if (messages.length === 0) return
    let ablyClient: import("ably").Realtime | null = null

    const connectAbly = async () => {
      try {
        const { default: Ably } = await import("ably")
        const client = new Ably.Realtime({ authUrl: "/api/ably-token", autoConnect: true })
        client.connection.on("failed", (err) => {
          console.warn("Ably connection failed:", err?.reason?.message)
        })
        client.connection.on("closed", () => {
          // Normal closure
        })

        ablyClient = client

        messages.forEach((msg) => {
          const channel = client.channels.get(`message:${msg.id}`)
          channel.subscribe("new-reply", (ablyMsg) => {
            const reply = normalizeReplyPayload(ablyMsg.data)
            if (!reply) return
            setMessages((prev) =>
              prev.map((m) =>
                m.id === msg.id
                  ? { ...m, replies: appendUniqueReply(m.replies, reply) }
                  : m
              )
            )
            setSelectedMessage((prev) =>
              prev?.id === msg.id
                ? { ...prev, replies: appendUniqueReply(prev.replies, reply) }
                : prev
            )
            showToast("success", "New reply received from the review team.")
            showBrowserNotification(
              "New reply received",
              "The review team replied to your message.",
              `svp-reply-${reply.id}`
            )
          })
        })
      } catch (err) {
        console.warn("Ably connection error:", err)
      }
    }

    void connectAbly()
    return () => {
      if (ablyClient) {
        try {
          if (ablyClient.connection && ablyClient.connection.state !== "closed") {
            ablyClient.close()
          }
        } catch {
          // Ignore connection close errors during unmount
        }
      }
    }
  }, [messages.length, showToast]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async () => {
    if (!content.trim()) {
      showToast("error", "Please enter a message")
      return
    }

    setSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: messageType,
          content: content.trim(),
          anonymous,
        }),
      })

      if (res.ok) {
        setContent("")
        setAnonymous(false)
        showToast("success", "Message sent")
        setActiveView("messages")
        void fetchMessages()
      } else {
        const err = await res.json()
        showToast("error", err.error || "Failed to send message")
      }
    } catch {
      showToast("error", "Network error. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const filteredMessages = useMemo(
    () =>
      activeView === "reports"
        ? messages.filter((m) => m.type === "harassment")
        : messages,
    [activeView, messages]
  )

  const stats = useMemo(() => {
    const list = activeView === "reports" ? filteredMessages : messages
    return [
      {
        label: "Total",
        value: list.length,
        icon: <MessageSquare className="size-4" />,
      },
      {
        label: "Pending",
        value: list.filter((m) => m.status === "pending").length,
        icon: <Clock className="size-4" />,
        tone: "warning" as const,
      },
      {
        label: "In review",
        value: list.filter((m) => m.status === "in_review").length,
        icon: <BookOpen className="size-4" />,
      },
      {
        label: "Resolved",
        value: list.filter((m) => m.status === "resolved").length,
        icon: <CheckCircle2 className="size-4" />,
        tone: "success" as const,
      },
    ]
  }, [activeView, filteredMessages, messages])

  const openMessage = (row: MessageRow) => {
    const full = messages.find((m) => m.id === row.id)
    if (full) {
      setSelectedMessage(full)
      setSheetOpen(true)
    }
  }

  const navItems = [
    { id: "compose", label: "Submit", icon: <Send className="size-4" /> },
    {
      id: "messages",
      label: "Messages",
      icon: <MessageSquare className="size-4" />,
      badge: messages.filter((m) => m.status === "pending").length,
    },
    {
      id: "reports",
      label: "Reports",
      icon: <AlertTriangle className="size-4" />,
    },
    { id: "settings", label: "Account", icon: <Settings className="size-4" /> },
  ]

  return (
    <DashboardShell
      user={user}
      role="student"
      title={copy.shellTitle}
      navItems={navItems}
      activeId={activeView}
      guideRole="student"
      onNavigate={(id) => setActiveView(id as ActiveView)}
    >
      {toast ? <ToastBanner type={toast.type} message={toast.text} /> : null}

      <div className="w-full space-y-4 sm:space-y-6">
        {activeView === "compose" ? (
          <>
            <DashboardPageHeader
              title={copy.compose.title}
              description={copy.compose.description}
            />

            <div className="dashboard-panel-elevated overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg">
                  {copy.compose.typeTitle}
                </CardTitle>
                <CardDescription className="text-sm">
                  {copy.compose.typeDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 p-4 sm:space-y-6 sm:p-6">
                <MessageTypePicker
                  value={messageType}
                  onChange={setMessageType}
                />

                {messageType === "harassment" ? (
                  <Alert>
                    <AlertDescription className="text-sm">
                      {copy.compose.harassmentNote}
                    </AlertDescription>
                  </Alert>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-sm font-medium">
                    Your message
                  </Label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                      messageType === "harassment"
                        ? "Describe what happened, when, where, and who was involved…"
                        : "Share feedback about teaching, exams, or learning…"
                    }
                    rows={5}
                    className="w-full rounded-xl border border-input/80 bg-muted/20 px-4 py-3 text-base shadow-inner transition-shadow focus-visible:border-primary/40 focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-primary/20 sm:text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {content.length} characters
                  </p>
                </div>

                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border/80 bg-muted/15 p-4 transition-colors hover:bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{copy.compose.anonymousLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {copy.compose.anonymousHint}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="size-5 rounded border-input sm:size-4"
                  />
                </label>

                <Button
                  type="button"
                  size="lg"
                  className="h-12 w-full rounded-xl text-base font-semibold shadow-md shadow-primary/20 sm:h-11 sm:text-sm"
                  disabled={sending || !content.trim()}
                  onClick={handleSend}
                >
                  {sending ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="size-4" aria-hidden="true" />
                  )}
                  {copy.compose.send}
                </Button>
              </CardContent>
            </div>
          </>
        ) : null}

        {activeView === "messages" || activeView === "reports" ? (
          <>
            <DashboardPageHeader
              title={
                activeView === "reports"
                  ? copy.messages.reportsTitle
                  : copy.messages.title
              }
              description={
                activeView === "reports"
                  ? copy.messages.reportsDescription
                  : copy.messages.description
              }
              actions={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9"
                  disabled={loading}
                  onClick={() => void fetchMessages()}
                >
                  Refresh
                </Button>
              }
            />

            <DashboardStats items={stats} />

            <MessagesTable
              variant="student"
              messages={filteredMessages}
              loading={loading}
              selectedId={selectedMessage?.id}
              onSelect={openMessage}
              emptyTitle="No messages yet"
              emptyDescription={
                activeView === "reports"
                  ? copy.messages.emptyReports
                  : copy.messages.empty
              }
              emptyAction={
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveView("compose")}
                >
                  {copy.messages.emptyAction}
                </Button>
              }
            />

            <StudentMessageSheet
              message={selectedMessage}
              open={sheetOpen}
              onOpenChange={(open) => {
                setSheetOpen(open)
                if (!open) setSelectedMessage(null)
              }}
            />
          </>
        ) : null}

        {activeView === "settings" ? (
          <div className="space-y-4 max-w-3xl animate-in fade-in duration-200">
            {/* Student Identity Card */}
            <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black text-base border border-emerald-500/20 shadow-xs">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-extrabold text-foreground">
                        {user.name || "University Student"}
                      </h2>
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-extrabold uppercase text-emerald-700 dark:text-emerald-300">
                        Verified Student
                      </span>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground break-all">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-muted/40 px-3 py-1 text-xs text-muted-foreground font-mono self-start sm:self-auto">
                  Account Status: <span className="font-bold text-emerald-600 dark:text-emerald-400">Approved</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 items-start">
              {/* Password & Security Card */}
              <ChangePasswordCard className="rounded-2xl border-border/80" />
            </div>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  )
}

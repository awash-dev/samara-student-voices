"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Bell, MessageSquare, Settings, Users } from "lucide-react"

import {
  ExecutiveInboxPanel,
  type ExecutiveMessage,
  type InboxFilter,
} from "@/components/dashboard/executive-inbox-panel"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { StudentDirectoryPanel } from "@/components/dashboard/student-directory-panel"
import { ToastBanner } from "@/components/dashboard/toast-banner"
import { ChangePasswordCard } from "@/components/auth/change-password-card"
import { SignOutButton } from "@/components/SignOutButton"
import { Badge } from "@/components/ui/badge"
import { showBrowserNotification } from "@/lib/browser-notifications"
import { DASHBOARD_COPY } from "@/lib/dashboard/copy"
import { appendUniqueReply, normalizeReplyPayload } from "@/lib/replies"
import type { SessionUser } from "@/lib/session"

const copy = DASHBOARD_COPY.executive

type ActiveView = "inbox" | "students" | "settings"

export function ExecutiveDashboardClient({ user }: { user: SessionUser }) {
  const [activeView, setActiveView] = useState<ActiveView>("inbox")
  const [messages, setMessages] = useState<ExecutiveMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<ExecutiveMessage | null>(null)
  const [filter, setFilter] = useState<InboxFilter>("all")
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  )

  const showToast = useCallback((type: "success" | "error", text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const handleSelectMessage = (msg: ExecutiveMessage | null) => {
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

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/messages")
      if (res.ok) {
        const data = (await res.json()) as ExecutiveMessage[]
        setMessages(data)
        setUnreadCount(data.filter((m) => m.status === "pending").length)
        setSelectedMessage((prev) => {
          if (prev) return data.find((m) => m.id === prev.id) ?? null
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search)
            const idParam = params.get("id") || params.get("messageId")
            if (idParam) {
              return data.find((m) => m.id === idParam || m.id.toLowerCase().startsWith(idParam.toLowerCase())) ?? null
            }
          }
          return null
        })
      } else {
        showToast("error", "Failed to load messages")
      }
    } catch {
      showToast("error", "Failed to load messages")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    if (params.get("id") || params.get("messageId")) {
      setActiveView("inbox")
    }
  }, [])

  useEffect(() => {
    if (activeView !== "inbox") return
    setLoading(true)
    void fetchMessages()
  }, [fetchMessages, activeView])

  // Persistent Ably Realtime Client Ref
  const ablyClientRef = useRef<import("ably").Realtime | null>(null)

  // 1. Maintain a single connection for the executive inbox channel.
  // Keep it alive across Students/Settings so notifications still pop up.
  useEffect(() => {
    let isCancelled = false

    const connectAbly = async () => {
      try {
        const { default: Ably } = await import("ably")
        if (isCancelled) return

        if (!ablyClientRef.current) {
          const client = new Ably.Realtime({
            authUrl: "/api/ably-token",
            autoConnect: true,
          })

          // Gracefully absorb connection events so no errors bubble up uncaught
          client.connection.on("failed", (err) => {
            console.warn("Ably connection failed:", err?.reason?.message)
          })
          client.connection.on("closed", () => {
            // Normal closure
          })
          client.connection.on("disconnected", () => {
            // Transient network disconnect
          })

          const channel = client.channels.get("executive:inbox")
          channel.subscribe("new-message", (ablyMsg) => {
            const payload =
              ablyMsg.data && typeof ablyMsg.data === "object"
                ? (ablyMsg.data as { messageId?: string })
                : null
            showToast("success", "New student message received.")
            showBrowserNotification(
              "New student message",
              "A new message is waiting in the executive inbox.",
              payload?.messageId ? `svp-message-${payload.messageId}` : undefined
            )
            void fetchMessages()
          })

          ablyClientRef.current = client
        }
      } catch (err) {
        console.warn("Ably initialization failed:", err)
      }
    }

    void connectAbly()

    return () => {
      isCancelled = true
      if (ablyClientRef.current) {
        try {
          const client = ablyClientRef.current
          ablyClientRef.current = null
          if (client.connection && client.connection.state !== "closed") {
            client.close()
          }
        } catch {
          // Ignore connection close errors during unmount
        }
      }
    }
  }, [fetchMessages, showToast])

  // 2. Subscribe to replies on the currently selected message without closing the client
  useEffect(() => {
    const selectedId = selectedMessage?.id
    if (!selectedId || !ablyClientRef.current) return

    const client = ablyClientRef.current
    const channel = client.channels.get(`message:${selectedId}`)

    const onNewReply = (msg: import("ably").Message) => {
      const reply = normalizeReplyPayload(msg.data)
      if (!reply) return
      setSelectedMessage((prev) =>
        prev && prev.id === selectedId
          ? { ...prev, replies: appendUniqueReply(prev.replies, reply) }
          : prev
      )
      setMessages((prev) =>
        prev.map((m) =>
          m.id === selectedId
            ? { ...m, replies: appendUniqueReply(m.replies, reply) }
            : m
        )
      )
    }

    channel.subscribe("new-reply", onNewReply)

    return () => {
      try {
        channel.unsubscribe("new-reply", onNewReply)
      } catch {
        // Ignore unsubscribe error
      }
    }
  }, [selectedMessage?.id])

  const handleReply = async (messageId: string, content: string) => {
    const res = await fetch("/api/replies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message_id: messageId, content }),
    })

    if (res.ok) {
      const payload = (await res.json()) as {
        id?: string
        reply_id?: string
        content?: string
        createdAt?: string
      }
      const newReply = {
        id: payload.reply_id || payload.id || "",
        content: payload.content || content,
        createdAt: payload.createdAt || new Date().toISOString(),
        senderEmail: user.email,
      }
      setSelectedMessage((prev) =>
        prev
          ? {
              ...prev,
              replies: appendUniqueReply(prev.replies, newReply),
              status: "in_review" as const,
            }
          : prev
      )
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                replies: appendUniqueReply(m.replies, newReply),
                status: "in_review" as const,
              }
            : m
        )
      )
      showToast("success", "Reply sent")
    } else {
      showToast("error", "Failed to send reply")
      throw new Error("Failed to send reply")
    }
  }

  const handleStatusChange = async (messageId: string, status: string) => {
    const res = await fetch(`/api/messages/${messageId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    if (res.ok) {
      const next = status as ExecutiveMessage["status"]
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, status: next } : m))
      )
      setSelectedMessage((prev) => (prev?.id === messageId ? { ...prev, status: next } : prev))
      showToast("success", "Status updated")
    } else {
      showToast("error", "Failed to update status")
    }
  }

  const handleNoteChange = async (messageId: string, note: string) => {
    const res = await fetch(`/api/messages/${messageId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: selectedMessage?.status || "in_review",
        internalNote: note,
      }),
    })

    if (res.ok) {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, internalNote: note } : m))
      )
      setSelectedMessage((prev) =>
        prev?.id === messageId ? { ...prev, internalNote: note } : prev
      )
      showToast("success", "Note saved")
    } else {
      showToast("error", "Failed to save note")
    }
  }

  return (
    <DashboardShell
      user={user}
      role="executive"
      title={copy.shellTitle}
      fullBleed={activeView === "inbox"}
      hideMobileNav={activeView === "inbox" && !!selectedMessage}
      navItems={[
        {
          id: "inbox",
          label: "Inbox",
          icon: <MessageSquare className="size-4" />,
          badge: unreadCount,
        },
        {
          id: "students",
          label: "Students",
          icon: <Users className="size-4" />,
        },
        {
          id: "settings",
          label: "Settings",
          icon: <Settings className="size-4" />,
        },
      ]}
      activeId={activeView}
      guideRole="executive"
      onNavigate={(id) => {
        setActiveView(id as ActiveView)
        if (id !== "inbox") setSelectedMessage(null)
      }}
      headerExtra={
        unreadCount > 0 ? (
          <Badge variant="destructive" className="gap-1 rounded-full">
            <Bell className="size-3" aria-hidden="true" />
            {unreadCount} {copy.inbox.pendingBadge}
          </Badge>
        ) : null
      }
    >
      {toast ? <ToastBanner type={toast.type} message={toast.text} /> : null}

      {activeView === "students" ? (
        <div className="w-full max-w-6xl mx-auto space-y-4">
          <StudentDirectoryPanel />
        </div>
      ) : null}

      {activeView === "settings" ? (
        <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
          {/* Executive Identity Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-xs sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/15 text-lg font-black text-indigo-700 shadow-xs dark:text-indigo-300 sm:size-14">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-extrabold text-foreground">
                      {user.name || "Student Executive Officer"}
                    </h2>
                    <span className="rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-indigo-700 dark:text-indigo-300">
                      Student Executive Council
                    </span>
                  </div>
                  <p className="break-all font-mono text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="self-start rounded-xl border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-mono text-muted-foreground sm:self-auto">
                Status: <span className="font-bold text-emerald-600 dark:text-emerald-400">Approved & Active</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Responsibilities & Confidentiality */}
            <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs space-y-3.5 text-xs">
              <h3 className="font-extrabold uppercase tracking-wider text-foreground text-xs flex items-center gap-2">
                Executive Ethics & Confidentiality
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                As a student executive, you are entrusted with identified student feedback.
                Harassment and anonymous reports are hidden from this inbox and handled only by Super Admin.
                This preserves student trust and prevents retaliation.
              </p>
              <div className="pt-2 border-t border-border/50 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Sensitive Report Visibility</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">Super Admin only</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Identified Feedback Access</span>
                  <span className="font-bold text-emerald-600">Enabled</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Official Reply Channel</span>
                  <span className="font-bold text-primary">Enabled</span>
                </div>
                <div className="pt-3 border-t border-border/50">
                  <SignOutButton
                    showLabel={true}
                    className="w-full justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs py-2.5 h-auto shadow-xs transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div>
              <ChangePasswordCard className="rounded-3xl border-border/80" />
            </div>
          </div>
        </div>
      ) : null}

      {activeView === "inbox" ? (
        <ExecutiveInboxPanel
          messages={messages}
          loading={loading}
          filter={filter}
          onFilterChange={setFilter}
          onRefresh={() => {
            setLoading(true)
            void fetchMessages()
          }}
          selectedMessage={selectedMessage}
          onSelectMessage={handleSelectMessage}
          onReply={handleReply}
          onStatusChange={handleStatusChange}
          onNoteChange={handleNoteChange}
        />
      ) : null}
    </DashboardShell>
  )
}

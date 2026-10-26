"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, Mail, Plus, RefreshCw, Search, Users } from "lucide-react"

import { ToastBanner } from "@/components/dashboard/toast-banner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { DASHBOARD_COPY } from "@/lib/dashboard/copy"
import { cn } from "@/lib/utils"

type StudentRow = {
  id: string
  email: string
  name: string | null
  approved: boolean
  createdAt: string
}

type SortKey = "name-asc" | "name-desc" | "newest" | "oldest"
type ViewFilter = "all" | "selected"

type EmailMode = "single" | "bulk" | "individual"

export function StudentDirectoryPanel() {
  const copy = DASHBOARD_COPY.executive.students
  const [students, setStudents] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("name-asc")
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all")
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())

  const [emailOpen, setEmailOpen] = useState(false)
  const [emailMode, setEmailMode] = useState<EmailMode>("single")
  const [emailTargets, setEmailTargets] = useState<StudentRow[]>([])
  const [individualEmail, setIndividualEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  )

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/executive/students")
      if (res.ok) setStudents(await res.json())
      else showToast("error", "Failed to load students")
    } catch {
      showToast("error", "Network error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchStudents()
  }, [fetchStudents])

  const searched = useMemo(() => {
    const q = query.toLowerCase().trim()
    let list = students
    if (q) {
      list = list.filter(
        (s) =>
          s.email.toLowerCase().includes(q) ||
          (s.name?.toLowerCase().includes(q) ?? false)
      )
    }
    return [...list].sort((a, b) => {
      switch (sort) {
        case "name-desc":
          return (b.name || b.email).localeCompare(a.name || a.email)
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        default:
          return (a.name || a.email).localeCompare(b.name || b.email)
      }
    })
  }, [students, query, sort])

  const filtered = useMemo(() => {
    if (viewFilter === "selected") {
      return searched.filter((s) => checkedIds.has(s.id))
    }
    return searched
  }, [searched, viewFilter, checkedIds])

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((s) => checkedIds.has(s.id))

  const toggleAllFiltered = () => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (allFilteredSelected) {
        filtered.forEach((s) => next.delete(s.id))
      } else {
        filtered.forEach((s) => next.add(s.id))
      }
      return next
    })
  }

  const toggleOne = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedStudents = useMemo(
    () => students.filter((s) => checkedIds.has(s.id)),
    [students, checkedIds]
  )

  const openEmailDialog = (
    mode: EmailMode,
    targets: StudentRow[] = [],
    presetEmail = ""
  ) => {
    setEmailMode(mode)
    setEmailTargets(targets)
    setIndividualEmail(presetEmail)
    setSubject(copy.defaultSubject)
    setMessage("")
    setEmailOpen(true)
  }

  const sendEmail = async () => {
    if (!subject.trim() || !message.trim()) return
    setSending(true)
    try {
      let body: Record<string, unknown> = {
        subject: subject.trim(),
        message: message.trim(),
      }

      if (emailMode === "individual") {
        if (!individualEmail.trim()) {
          showToast("error", copy.individualEmailRequired)
          return
        }
        body = { ...body, email: individualEmail.trim().toLowerCase() }
      } else if (emailMode === "bulk") {
        const ids =
          emailTargets.length > 0
            ? emailTargets.map((s) => s.id)
            : selectedStudents.map((s) => s.id)
        if (ids.length === 0) {
          showToast("error", copy.selectStudentsFirst)
          return
        }
        body = { ...body, studentIds: ids }
      } else if (emailTargets[0]) {
        body = { ...body, studentId: emailTargets[0].id }
      } else {
        return
      }

      const res = await fetch("/api/executive/students/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        showToast(
          "success",
          copy.sentToast.replace("{count}", String(data.sent ?? 1))
        )
        setEmailOpen(false)
        if (emailMode === "bulk") setCheckedIds(new Set())
      } else {
        showToast("error", data.error || "Failed to send email")
      }
    } catch {
      showToast("error", "Network error")
    } finally {
      setSending(false)
    }
  }

  const emailDialogDescription = () => {
    if (emailMode === "individual") {
      return copy.individualDialogDescription
    }
    if (emailMode === "bulk") {
      const count =
        emailTargets.length > 0 ? emailTargets.length : selectedStudents.length
      return copy.bulkDialogDescription.replace("{count}", String(count))
    }
    return (
      <>
        {copy.emailDialogDescription}{" "}
        <span className="font-medium text-foreground">
          {emailTargets[0]?.email}
        </span>
      </>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4 sm:gap-6">
      {toast ? <ToastBanner type={toast.type} message={toast.text} /> : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{copy.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy.description}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={fetchStudents}
        >
          <RefreshCw
            className={cn("size-4", loading && "animate-spin")}
            aria-hidden="true"
          />
          {copy.refresh}
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            disabled={selectedStudents.length === 0}
            onClick={() => openEmailDialog("bulk")}
          >
            <Mail className="size-4" aria-hidden="true" />
            {copy.emailSelected.replace(
              "{count}",
              String(selectedStudents.length)
            )}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={searched.length === 0}
            onClick={() => openEmailDialog("bulk", searched)}
          >
            {copy.emailAllFiltered.replace("{count}", String(searched.length))}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => openEmailDialog("individual")}
          >
            <Plus className="size-4" aria-hidden="true" />
            {copy.emailIndividual}
          </Button>
          {checkedIds.size > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setCheckedIds(new Set())}
            >
              {copy.clearSelection}
            </Button>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              placeholder={copy.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-background pl-9"
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-full bg-background lg:w-[160px]">
              <SelectValue placeholder={copy.sortLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">{copy.sortNameAsc}</SelectItem>
              <SelectItem value="name-desc">{copy.sortNameDesc}</SelectItem>
              <SelectItem value="newest">{copy.sortNewest}</SelectItem>
              <SelectItem value="oldest">{copy.sortOldest}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={viewFilter}
            onValueChange={(v) => setViewFilter(v as ViewFilter)}
          >
            <SelectTrigger className="w-full bg-background lg:w-[160px]">
              <SelectValue placeholder={copy.viewLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{copy.viewAll}</SelectItem>
              <SelectItem value="selected">
                {copy.viewSelected.replace(
                  "{count}",
                  String(selectedStudents.length)
                )}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            <Users className="size-4" aria-hidden="true" />
            {copy.tableTitle}
            <Badge variant="secondary">{filtered.length}</Badge>
            {checkedIds.size > 0 ? (
              <Badge variant="outline">
                {copy.selectedCount.replace("{count}", String(checkedIds.size))}
              </Badge>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {viewFilter === "selected" ? copy.emptySelected : copy.empty}
            </p>
          ) : (
            <>
              {/* Mobile Card View (< md) */}
              <div className="divide-y divide-border/50 md:hidden">
                <div className="flex items-center justify-between p-3 bg-muted/20 text-xs text-muted-foreground border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={allFilteredSelected}
                      onCheckedChange={toggleAllFiltered}
                      aria-label={copy.selectAll}
                    />
                    <span className="font-semibold text-foreground">Select All ({filtered.length})</span>
                  </div>
                  <span>{copy.tableTitle}</span>
                </div>
                {filtered.map((student) => {
                  const isChecked = checkedIds.has(student.id)
                  return (
                    <div
                      key={student.id}
                      className={cn(
                        "p-3.5 flex flex-col gap-2 transition-colors",
                        isChecked && "bg-muted/40"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleOne(student.id)}
                            className="mt-1"
                            aria-label={copy.selectRow.replace("{email}", student.email)}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {student.name || "Student"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 px-2.5 rounded-lg shrink-0 gap-1 text-xs"
                          onClick={() => openEmailDialog("single", [student])}
                        >
                          <Mail className="size-3.5" aria-hidden="true" />
                          <span>Email</span>
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pl-7">
                        <span>Joined: {new Date(student.createdAt).toLocaleDateString()}</span>
                        <Badge variant="outline" className="text-[10px] h-4">
                          Verified
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop & Tablet Table (md+) */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={allFilteredSelected}
                          onCheckedChange={toggleAllFiltered}
                          aria-label={copy.selectAll}
                        />
                      </TableHead>
                      <TableHead>{copy.colName}</TableHead>
                      <TableHead>{copy.colEmail}</TableHead>
                      <TableHead>{copy.colJoined}</TableHead>
                      <TableHead className="text-right">{copy.colActions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((student) => (
                      <TableRow
                        key={student.id}
                        data-state={checkedIds.has(student.id) ? "selected" : undefined}
                        className="data-[state=selected]:bg-muted/50"
                      >
                        <TableCell>
                          <Checkbox
                            checked={checkedIds.has(student.id)}
                            onCheckedChange={() => toggleOne(student.id)}
                            aria-label={copy.selectRow.replace(
                              "{email}",
                              student.email
                            )}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.name || "—"}
                        </TableCell>
                        <TableCell className="max-w-[240px] truncate">
                          {student.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openEmailDialog("single", [student])}
                          >
                            <Mail className="size-4" aria-hidden="true" />
                            <span className="hidden sm:inline">
                              {copy.emailAction}
                            </span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {emailMode === "individual"
                ? copy.individualDialogTitle
                : emailMode === "bulk"
                  ? copy.bulkDialogTitle
                  : copy.emailDialogTitle}
            </DialogTitle>
            <DialogDescription>{emailDialogDescription()}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {emailMode === "individual" ? (
              <div className="space-y-2">
                <Label htmlFor="individual-email">{copy.individualEmailLabel}</Label>
                <Input
                  id="individual-email"
                  type="email"
                  value={individualEmail}
                  onChange={(e) => setIndividualEmail(e.target.value)}
                  placeholder={copy.individualEmailPlaceholder}
                />
              </div>
            ) : emailMode === "bulk" ? (
              <div className="max-h-28 overflow-y-auto rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                {(emailTargets.length > 0 ? emailTargets : selectedStudents).map(
                  (s) => (
                    <div key={s.id} className="truncate">
                      {s.name ? `${s.name} · ` : ""}
                      {s.email}
                    </div>
                  )
                )}
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email-subject">{copy.subjectLabel}</Label>
              <Input
                id="email-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-message">{copy.messageLabel}</Label>
              <Textarea
                id="email-message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={copy.messagePlaceholder}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEmailOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={sending || !subject.trim() || !message.trim()}
              onClick={sendEmail}
            >
              {sending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Mail className="size-4" aria-hidden="true" />
              )}
              {emailMode === "bulk" ? copy.sendBulkLabel : copy.sendLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

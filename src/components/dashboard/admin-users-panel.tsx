"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Download,
  KeyRound,
  Loader2,
  Pencil,
  RefreshCw,
  Trash2,
  UserCog,
  UserPlus,
} from "lucide-react"

import { ToastBanner } from "@/components/dashboard/toast-banner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { DASHBOARD_COPY } from "@/lib/dashboard/copy"
import { ROLE_LABELS } from "@/lib/auth/roles"

type ManagedUser = {
  id: string
  email: string
  name: string | null
  role: "student" | "executive" | "admin" | "superadmin"
  approved: boolean
  createdAt: string
  authUserId: string | null
}

type RoleFilter = "all" | "student" | "executive" | "admin"

type AdminUsersPanelProps = {
  /** Superadmin: list and manage all roles including admins */
  fullAccess?: boolean
}

export function AdminUsersPanel({ fullAccess = false }: AdminUsersPanelProps) {
  const copy = DASHBOARD_COPY.admin.users
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [editUser, setEditUser] = useState<ManagedUser | null>(null)
  const [passwordUser, setPasswordUser] = useState<ManagedUser | null>(null)
  const [customPassword, setCustomPassword] = useState("")
  const [createUserOpen, setCreateUserOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    role: "student" as ManagedUser["role"],
    password: "",
    approved: true,
  })
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "student" as ManagedUser["role"],
    approved: true,
  })
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  )

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const q =
        roleFilter === "all" ? "" : `?role=${roleFilter}`
      const res = await fetch(`/api/admin/users${q}`)
      if (res.ok) setUsers(await res.json())
      else showToast("error", "Failed to load users")
    } catch {
      showToast("error", "Network error")
    } finally {
      setLoading(false)
    }
  }, [roleFilter])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  const exportUsers = async () => {
    try {
      const res = await fetch("/api/admin/users/export")
      if (!res.ok) throw new Error("Failed to export")
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "user.txt"
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      showToast("success", "Saved user.txt successfully")
    } catch {
      showToast("error", "Failed to export user.txt")
    }
  }

  const isProtectedRole = (role: ManagedUser["role"]) =>
    role === "admin" || role === "superadmin"

  const canManageUser = (user: ManagedUser) =>
    user.role !== "superadmin" && (fullAccess || !isProtectedRole(user.role))

  const openEdit = (user: ManagedUser) => {
    if (!fullAccess && isProtectedRole(user.role)) return
    if (user.role === "superadmin") return
    setEditUser(user)
    setEditForm({
      name: user.name ?? "",
      email: user.email,
      role: user.role,
      approved: user.approved,
    })
  }

  const saveEdit = async () => {
    if (!editUser) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (res.ok) {
        showToast("success", copy.updatedToast)
        setEditUser(null)
        void fetchUsers()
      } else {
        showToast("error", data.error || "Update failed")
      }
    } finally {
      setBusy(false)
    }
  }

  const deleteUser = async (user: ManagedUser) => {
    if (!fullAccess && isProtectedRole(user.role)) return
    if (user.role === "superadmin") return
    if (!confirm(copy.deleteConfirm.replace("{email}", user.email))) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" })
      const data = await res.json()
      if (res.ok) {
        showToast("success", copy.deletedToast)
        void fetchUsers()
      } else {
        showToast("error", data.error || "Delete failed")
      }
    } finally {
      setBusy(false)
    }
  }

  const resetPassword = async (user: ManagedUser) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      })
      const data = await res.json()
      if (res.ok) showToast("success", data.message || copy.resetSentToast)
      else showToast("error", data.error || "Reset failed")
    } finally {
      setBusy(false)
    }
  }

  const setPassword = async () => {
    if (!passwordUser || customPassword.length < 8) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/users/${passwordUser.id}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set", newPassword: customPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast("success", data.message || copy.passwordSetToast)
        setPasswordUser(null)
        setCustomPassword("")
      } else {
        showToast("error", data.error || "Failed to set password")
      }
    } finally {
      setBusy(false)
    }
  }

  const handleCreateUser = async () => {
    if (!createForm.email || !createForm.password) {
      showToast("error", "Email and password are required")
      return
    }
    if (createForm.password.length < 8) {
      showToast("error", "Password must be at least 8 characters")
      return
    }
    setBusy(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      })
      const data = await res.json()
      if (res.ok) {
        showToast("success", "User registered successfully")
        setCreateUserOpen(false)
        setCreateForm({
          name: "",
          email: "",
          role: "student",
          password: "",
          approved: true,
        })
        void fetchUsers()
      } else {
        showToast("error", data.error || "Failed to register user")
      }
    } catch {
      showToast("error", "Network error")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      {toast ? <ToastBanner type={toast.type} message={toast.text} /> : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{copy.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy.description}</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v as RoleFilter)}
          >
            <SelectTrigger className="col-span-2 w-full sm:w-[140px]">
              <SelectValue placeholder={copy.filterRole} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{copy.filterAll}</SelectItem>
              <SelectItem value="student">{ROLE_LABELS.student}</SelectItem>
              <SelectItem value="executive">{ROLE_LABELS.executive}</SelectItem>
              {fullAccess ? (
                <SelectItem value="admin">{ROLE_LABELS.admin}</SelectItem>
              ) : null}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={fetchUsers}
            className="w-full sm:w-auto"
          >
            <RefreshCw
              className={loading ? "size-4 animate-spin" : "size-4"}
              aria-hidden="true"
            />
            {copy.refresh}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={exportUsers}
            title="Download all user data and save user.txt"
            className="col-span-2 w-full sm:col-span-1 sm:w-auto"
          >
            <Download className="size-4" aria-hidden="true" />
            Save user.txt
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setCreateUserOpen(true)}
            className="col-span-2 w-full sm:col-span-1 sm:w-auto gap-1.5"
          >
            <UserPlus className="size-4" aria-hidden="true" />
            Register User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCog className="size-4" aria-hidden="true" />
            {copy.tableTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : users.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {copy.empty}
            </p>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="space-y-3 sm:hidden">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-xl border border-border bg-card p-3.5"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-medium">
                        {user.name || "—"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary" className="capitalize">
                        {ROLE_LABELS[user.role]}
                      </Badge>
                      <Badge variant={user.approved ? "default" : "outline"}>
                        {user.approved ? copy.statusApproved : copy.statusPending}
                      </Badge>
                    </div>

                    {canManageUser(user) ? (
                      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/60 pt-3">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-auto w-full flex-col gap-1 px-1 py-2 text-[11px]"
                          onClick={() => openEdit(user)}
                        >
                          <Pencil className="size-3.5" aria-hidden="true" />
                          {copy.editAction}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-auto w-full flex-col gap-1 px-1 py-2 text-[11px]"
                          onClick={() => {
                            setPasswordUser(user)
                            setCustomPassword("")
                          }}
                        >
                          <KeyRound className="size-3.5" aria-hidden="true" />
                          {copy.passwordAction}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-auto w-full flex-col gap-1 px-1 py-2 text-[11px] text-destructive"
                          disabled={busy}
                          onClick={() => deleteUser(user)}
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                          {copy.deleteAction}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto rounded-lg border border-border sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{copy.colName}</TableHead>
                      <TableHead>{copy.colEmail}</TableHead>
                      <TableHead>{copy.colRole}</TableHead>
                      <TableHead>{copy.colStatus}</TableHead>
                      <TableHead className="text-right">{copy.colActions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name || "—"}
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {ROLE_LABELS[user.role]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.approved ? "default" : "outline"}>
                            {user.approved ? copy.statusApproved : copy.statusPending}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {canManageUser(user) ? (
                            <div className="flex justify-end gap-1">
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                title={copy.editAction}
                                onClick={() => openEdit(user)}
                              >
                                <Pencil className="size-4" aria-hidden="true" />
                              </Button>
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                title={copy.passwordAction}
                                onClick={() => {
                                  setPasswordUser(user)
                                  setCustomPassword("")
                                }}
                              >
                                <KeyRound className="size-4" aria-hidden="true" />
                              </Button>
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                title={copy.deleteAction}
                                disabled={busy}
                                onClick={() => deleteUser(user)}
                              >
                                <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
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

      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.editDialogTitle}</DialogTitle>
            <DialogDescription>{copy.editDialogDescription}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{copy.nameLabel}</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">{copy.emailLabel}</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{copy.roleLabel}</Label>
              <Select
                value={editForm.role}
                onValueChange={(v) =>
                  setEditForm((f) => ({
                    ...f,
                    role: v as ManagedUser["role"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">{ROLE_LABELS.student}</SelectItem>
                  <SelectItem value="executive">{ROLE_LABELS.executive}</SelectItem>
                  {fullAccess ? (
                    <>
                      <SelectItem value="admin">{ROLE_LABELS.admin}</SelectItem>
                      <SelectItem value="superadmin">{ROLE_LABELS.superadmin}</SelectItem>
                    </>
                  ) : null}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editForm.approved}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, approved: e.target.checked }))
                }
                className="size-4 rounded border-input"
              />
              {copy.approvedLabel}
            </label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditUser(null)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="button" disabled={busy} onClick={saveEdit}>
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {copy.saveLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      

      <Dialog
        open={!!passwordUser}
        onOpenChange={(o) => !o && setPasswordUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.passwordDialogTitle}</DialogTitle>
            <DialogDescription>
              {passwordUser?.email} — {copy.passwordDialogDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={busy}
              onClick={() => passwordUser && resetPassword(passwordUser)}
            >
              {copy.resetEmailLabel}
            </Button>
            <div className="space-y-2">
              <Label htmlFor="new-password">{copy.customPasswordLabel}</Label>
              <Input
                id="new-password"
                type="password"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                placeholder={copy.customPasswordPlaceholder}
                autoComplete="new-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPasswordUser(null)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={busy || customPassword.length < 8}
              onClick={setPassword}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {copy.setPasswordLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={createUserOpen}
        onOpenChange={(o) => {
          if (!busy) setCreateUserOpen(o)
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="size-5 text-primary" aria-hidden="true" />
              Register New User
            </DialogTitle>
            <DialogDescription>
              Create a new user account with login credentials and assigned system role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="create-name">Full Name</Label>
              <Input
                id="create-name"
                placeholder="e.g. Abebe Bikila"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, name: e.target.value }))
                }
                disabled={busy}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-email">University / Official Email *</Label>
              <Input
                id="create-email"
                type="email"
                placeholder="e.g. su1701862@samu.edu.et"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, email: e.target.value }))
                }
                disabled={busy}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-password">Initial Password (min 8 characters) *</Label>
              <Input
                id="create-password"
                type="password"
                placeholder="••••••••"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, password: e.target.value }))
                }
                disabled={busy}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label>System Role</Label>
              <Select
                value={createForm.role}
                onValueChange={(v) =>
                  setCreateForm((f) => ({
                    ...f,
                    role: v as ManagedUser["role"],
                  }))
                }
                disabled={busy}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">{ROLE_LABELS.student}</SelectItem>
                  <SelectItem value="executive">{ROLE_LABELS.executive}</SelectItem>
                  {fullAccess ? (
                    <>
                      <SelectItem value="admin">{ROLE_LABELS.admin}</SelectItem>
                      <SelectItem value="superadmin">{ROLE_LABELS.superadmin}</SelectItem>
                    </>
                  ) : null}
                </SelectContent>
              </Select>
            </div>
            <div className="pt-2">
              <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={createForm.approved}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, approved: e.target.checked }))
                  }
                  disabled={busy}
                  className="size-4 rounded border-input"
                />
                <span>Approve user immediately (grant dashboard access)</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateUserOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={busy || !createForm.email || createForm.password.length < 8}
              onClick={handleCreateUser}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin mr-1.5" aria-hidden="true" />
              ) : null}
              Create User Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

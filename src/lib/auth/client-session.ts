import { getDashboardPath, type AppRole } from "@/lib/auth/roles"

export const OAUTH_PENDING_ROLE_KEY = "oauth_pending_role"

export type SessionUserPayload = {
  id: string
  email: string
  name: string | null
  role: AppRole
  approved: boolean
}

export function storeOAuthPendingRole(role: "student" | "executive") {
  sessionStorage.setItem(OAUTH_PENDING_ROLE_KEY, role)
}

export function consumeOAuthPendingRole(): "student" | "executive" | null {
  const value = sessionStorage.getItem(OAUTH_PENDING_ROLE_KEY)
  sessionStorage.removeItem(OAUTH_PENDING_ROLE_KEY)
  if (value === "student" || value === "executive") return value
  return null
}

export function redirectByRole(role: string, approved: boolean) {
  if (role === "student" || role === "executive" || role === "admin" || role === "superadmin") {
    window.location.href = getDashboardPath(role as AppRole, approved)
    return
  }
  window.location.href = "/auth/sign-in"
}

async function syncDbUser(roleForCreate?: "student" | "executive", retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    let res = await fetch("/api/auth/sync")

    if (res.status === 401) {
      if (attempt < retries) {
        const delay = 400 + attempt * 300 // 400ms, 700ms, 1000ms
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      return { ok: false as const, reason: "unauthorized" as const }
    }

    if (res.status === 404) {
      const pendingRole = consumeOAuthPendingRole() ?? roleForCreate ?? "student"
      res = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: pendingRole }),
      })

      if (!res.ok) {
        return { ok: false as const, reason: "sync_failed" as const }
      }
    } else if (!res.ok) {
      return { ok: false as const, reason: "sync_failed" as const }
    }

    const sessionRes = await fetch("/api/auth/session")
    if (sessionRes.ok) {
      const user = (await sessionRes.json()) as SessionUserPayload
      return { ok: true as const, user }
    }

    try {
      const fallbackUser = (await res.json()) as SessionUserPayload
      if (fallbackUser?.role) {
        return { ok: true as const, user: fallbackUser }
      }
    } catch {}

    if (attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, 400))
      continue
    }
    return { ok: false as const, reason: "sync_failed" as const }
  }
  
  return { ok: false as const, reason: "unauthorized" as const }
}

export async function completeAuthSession(options?: {
  defaultRoleOnCreate?: "student" | "executive"
}): Promise<
  | { ok: true; role: AppRole; approved: boolean }
  | { ok: false; reason: "no_account" | "sync_failed" | "unauthorized" }
> {
  const result = await syncDbUser(options?.defaultRoleOnCreate)

  if (!result.ok) return result

  return {
    ok: true,
    role: result.user.role,
    approved: result.user.approved,
  }
}

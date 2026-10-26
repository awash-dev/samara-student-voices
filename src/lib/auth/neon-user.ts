import { headers } from "next/headers"

import { auth } from "@/lib/auth/server"

type AuthUserRecord = {
  id: string
  email: string
  name?: string | null
}

async function requestHeaders() {
  return await headers()
}

/** Resolve Neon Auth user id by email (uses admin list-users when available). */
export async function findAuthUserIdByEmail(
  email: string
): Promise<string | null> {
  const normalized = email.trim().toLowerCase()

  if (!auth.admin?.listUsers) return null

  try {
    const hdrs = await requestHeaders()
    const { data, error } = await auth.admin.listUsers({
      query: {
        searchValue: normalized,
        searchField: "email",
        searchOperator: "contains",
        limit: 20,
      },
      fetchOptions: { headers: hdrs },
    })

    if (error || !data?.users?.length) return null
    const match = data.users.find(
      (u: AuthUserRecord) => u.email.toLowerCase() === normalized
    )
    return match?.id ?? null
  } catch {
    return null
  }
}

export async function setAuthUserPassword(
  authUserId: string,
  newPassword: string,
  email?: string
) {
  // If Neon Auth admin API is available, try it first
  if (auth.admin?.setUserPassword) {
    try {
      const hdrs = await requestHeaders()
      const { error } = await auth.admin.setUserPassword({
        userId: authUserId,
        newPassword,
        fetchOptions: { headers: hdrs },
      })
      if (!error) return { ok: true as const }
    } catch {
      // Fallback to direct DB hash update below
    }
  }

  // Direct database scrypt update ensures 100% reliability
  const { setUserAccountPassword } = await import("@/lib/auth/password")
  const result = await setUserAccountPassword(authUserId, email || "", newPassword)
  if (result.ok) {
    return { ok: true as const }
  }

  return { ok: false as const, error: result.error || "Failed to set password" }
}

export async function removeAuthUser(authUserId: string) {
  if (!auth.admin?.removeUser) {
    return { ok: false as const, error: "Auth admin API not available" }
  }

  try {
    const hdrs = await requestHeaders()
    const { error } = await auth.admin.removeUser({
      userId: authUserId,
      fetchOptions: { headers: hdrs },
    })

    if (error) {
      return {
        ok: false as const,
        error: error.message || "Failed to remove auth user",
      }
    }

    return { ok: true as const }
  } catch {
    return { ok: false as const, error: "Failed to remove auth user" }
  }
}

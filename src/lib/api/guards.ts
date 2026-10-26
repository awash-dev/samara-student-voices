import { getSessionUser, type SessionUser } from "@/lib/session"
import { isAdminRole, type AppRole } from "@/lib/auth/roles"

export async function requireSession(): Promise<
  SessionUser | Response
> {
  const user = await getSessionUser()
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!user.approved) {
    return Response.json({ error: "Account not approved" }, { status: 403 })
  }
  return user
}

export async function requireRole(
  roles: AppRole[]
): Promise<SessionUser | Response> {
  const result = await requireSession()
  if (result instanceof Response) return result
  if (!roles.includes(result.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }
  return result
}

export async function requireAdminRole(): Promise<SessionUser | Response> {
  const result = await requireSession()
  if (result instanceof Response) return result
  if (!isAdminRole(result.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }
  return result
}

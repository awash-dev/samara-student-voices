import type { AppRole } from "@/lib/auth/roles"
import { isAppRole } from "@/lib/auth/roles"

const WEEK = 60 * 60 * 24 * 7

export const AUTH_COOKIE_OPTIONS = {
  path: "/",
  maxAge: WEEK,
  sameSite: "lax" as const,
}

export function parseRoleCookie(value: string | undefined): AppRole | null {
  if (!value || !isAppRole(value)) return null
  return value
}

export function parseApprovedCookie(value: string | undefined): boolean {
  return value === "1"
}

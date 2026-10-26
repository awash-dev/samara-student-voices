import { redirect } from "next/navigation"

import { getDashboardPath } from "@/lib/auth/roles"
import { getSessionUser } from "@/lib/session"

export async function redirectIfAuthenticated() {
  const user = await getSessionUser()
  if (user) {
    redirect(getDashboardPath(user.role, user.approved))
  }
}

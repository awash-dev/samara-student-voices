import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/session"
import { getDashboardPath } from "@/lib/auth/roles"
import { PendingApprovalClient } from "./client"

export const dynamic = "force-dynamic"

export default async function PendingApprovalPage() {
  const user = await getSessionUser()

  // If user is already approved, immediately send them to their dashboard
  if (user && user.approved) {
    redirect(getDashboardPath(user.role, true))
  }

  return <PendingApprovalClient user={user} />
}

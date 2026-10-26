export type AppRole = "student" | "executive" | "admin" | "superadmin"

export const ROLE_DASHBOARD: Record<AppRole, string> = {
  student: "/dashboard",
  executive: "/executive",
  admin: "/admin",
  superadmin: "/superadmin",
}

export function isAppRole(value: string): value is AppRole {
  return value === "student" || value === "executive" || value === "admin" || value === "superadmin"
}

export function getDashboardPath(role: AppRole, approved: boolean): string {
  if (!approved) return "/pending-approval"
  return ROLE_DASHBOARD[role]
}

export const ROLE_LABELS: Record<AppRole, string> = {
  student: "Student",
  executive: "Executive",
  admin: "Admin",
  superadmin: "Super Admin",
}

export function isAdminRole(role: string): boolean {
  return role === "admin" || role === "superadmin"
}

export function canViewAllMessages(role: string): boolean {
  return role === "executive" || role === "superadmin"
}

/**
 * Harassment and anonymous reports are restricted to Super Admin.
 * Executives never receive these reports in their inbox or API responses.
 */
export function canViewSensitiveReports(role: string): boolean {
  return role === "superadmin"
}

export function isReportRestrictedToSuperadmin(report: {
  type: string
  anonymous: boolean
}): boolean {
  return report.type === "harassment" || report.anonymous
}


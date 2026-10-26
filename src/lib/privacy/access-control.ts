/**
 * Shared access-control model: stored app consent vs live browser permission state.
 * Device capabilities use this; cookie categories follow the same merge pattern separately.
 */

export type PermissionState =
  | "granted"
  | "denied"
  | "prompt"
  | "unsupported"
  | "unknown"

export type AccessFlagMap<T extends string> = Record<T, boolean>

/** Merge stored flags with privacy-safe defaults (unspecified keys stay off). */
export function mergeAccessFlags<T extends string>(
  defaults: AccessFlagMap<T>,
  stored?: Partial<AccessFlagMap<T>> | null
): AccessFlagMap<T> {
  return { ...defaults, ...stored }
}

export type LiveAccessRow<T extends string> = {
  id: T
  label: string
  description: string
  /** User opted in via preferences (stored in DB / cookies) */
  appConsent: boolean
  /** Current browser Permission API state (polled live) */
  browserState: PermissionState
  /** App may use the capability right now */
  effective: boolean
}

/** App consent + browser grant, or consent-only when the API is unsupported (e.g. file picker). */
export function isAccessEffective(
  appConsent: boolean,
  browserState: PermissionState
): boolean {
  if (!appConsent) return false
  if (browserState === "unsupported" || browserState === "unknown") return true
  return browserState === "granted"
}

export function browserStateLabel(state: PermissionState): string {
  switch (state) {
    case "granted":
      return "Browser: allowed"
    case "denied":
      return "Browser: blocked"
    case "prompt":
      return "Browser: not asked yet"
    case "unsupported":
      return "Browser: not applicable"
    default:
      return "Browser: unknown"
  }
}

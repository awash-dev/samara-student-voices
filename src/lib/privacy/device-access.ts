import {
  isAccessEffective,
  mergeAccessFlags,
  type LiveAccessRow,
  type PermissionState,
} from "@/lib/privacy/access-control"

export type { PermissionState, LiveAccessRow }

/** Device capabilities the app may request (browser permission prompts) */
export const DEVICE_PERMISSIONS = [  "camera",
  "microphone",
  "geolocation",
  "notifications",
  "gallery",
  "clipboard",
] as const

export type DevicePermission = (typeof DEVICE_PERMISSIONS)[number]

export type DevicePermissionMeta = {
  id: DevicePermission
  label: string
  description: string
  permissionName?: PermissionName | "clipboard-read"
}

export const DEVICE_PERMISSION_META: Record<DevicePermission, DevicePermissionMeta> = {
  camera: {
    id: "camera",
    label: "Camera",
    description: "Live video preview (e.g. profile or support calls).",
    permissionName: "camera",
  },
  microphone: {
    id: "microphone",
    label: "Microphone",
    description: "Audio input for calls or voice messages.",
    permissionName: "microphone",
  },
  geolocation: {
    id: "geolocation",
    label: "Location",
    description: "Approximate GPS coordinates when you choose to share location.",
    permissionName: "geolocation",
  },
  notifications: {
    id: "notifications",
    label: "Notifications",
    description: "Browser push alerts for replies and approvals.",
    permissionName: "notifications",
  },
  gallery: {
    id: "gallery",
    label: "Photos & files",
    description: "Pick images or documents from your device gallery or file system.",
  },
  clipboard: {
    id: "clipboard",
    label: "Clipboard",
    description: "Read or write clipboard when you use copy actions.",
    permissionName: "clipboard-read",
  },
}

/** Privacy-by-default: nothing is requested until the user opts in. */
export const DEFAULT_DEVICE_PERMISSIONS: Record<DevicePermission, boolean> = {
  camera: false,
  microphone: false,
  geolocation: false,
  notifications: false,
  gallery: false,
  clipboard: false,
}

/** @deprecated Use LiveAccessRow */
export type LivePermissionStatus = LiveAccessRow<DevicePermission>

export function mergeDevicePermissions(
  stored: Record<string, boolean> | null | undefined
): Record<DevicePermission, boolean> {
  return mergeAccessFlags(
    DEFAULT_DEVICE_PERMISSIONS,
    stored as Partial<Record<DevicePermission, boolean>>
  )
}
export async function queryBrowserPermission(
  name: PermissionName | "clipboard-read" | undefined
): Promise<PermissionState> {
  if (!name || typeof navigator === "undefined" || !navigator.permissions?.query) {
    return "unsupported"
  }
  try {
    const result = await navigator.permissions.query({
      name: name as PermissionName,
    })
    return result.state as PermissionState
  } catch {
    return "unsupported"
  }
}

export async function pollDeviceAccessRows(
  appConsents: Record<DevicePermission, boolean>
): Promise<LiveAccessRow<DevicePermission>[]> {
  return Promise.all(
    DEVICE_PERMISSIONS.map(async (id) => {
      const meta = DEVICE_PERMISSION_META[id]
      const browserState = await queryBrowserPermission(meta.permissionName)
      const appConsent = appConsents[id] === true
      return {
        id,
        label: meta.label,
        description: meta.description,
        appConsent,
        browserState,
        effective: isAccessEffective(appConsent, browserState),
      }
    })
  )
}

/** @deprecated Use pollDeviceAccessRows */
export async function pollAllDevicePermissions(
  userConsents: Record<DevicePermission, boolean>
): Promise<LivePermissionStatus[]> {
  return pollDeviceAccessRows(userConsents)
}

/** Enable app consent for capabilities the browser has already granted. */
export function appConsentsFromBrowserRows(
  rows: LiveAccessRow<DevicePermission>[]
): Partial<Record<DevicePermission, boolean>> {
  const patch: Partial<Record<DevicePermission, boolean>> = {}
  for (const row of rows) {
    if (row.browserState === "granted") {
      patch[row.id] = true
    }
  }
  return patch
}

export async function requestDeviceAccess(
  id: DevicePermission
): Promise<{ ok: boolean; message?: string; data?: unknown }> {
  try {
    switch (id) {
      case "camera": {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach((t) => t.stop())
        return { ok: true, message: "Camera access granted" }
      }
      case "microphone": {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((t) => t.stop())
        return { ok: true, message: "Microphone access granted" }
      }
      case "geolocation": {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
          })
        )
        return {
          ok: true,
          message: "Location access granted",
          data: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          },
        }
      }
      case "notifications": {
        const perm = await Notification.requestPermission()
        return {
          ok: perm === "granted",
          message: perm === "granted" ? "Notifications enabled" : `Notifications: ${perm}`,
        }
      }
      case "gallery":
        return {
          ok: true,
          message: "Use the file picker below to access photos and files",
        }
      case "clipboard": {
        if (!navigator.clipboard?.readText) {
          return { ok: false, message: "Clipboard API not supported" }
        }
        await navigator.clipboard.readText()
        return { ok: true, message: "Clipboard read access granted" }
      }
      default:
        return { ok: false, message: "Unknown permission" }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Permission denied"
    return { ok: false, message: msg }
  }
}

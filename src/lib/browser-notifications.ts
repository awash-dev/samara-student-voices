"use client"

/**
 * Show a native browser notification only when the user has already granted
 * permission through the privacy/device-access settings. Never prompts here.
 */
export function showBrowserNotification(
  title: string,
  body: string,
  tag?: string
): void {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return
  }
  if (Notification.permission !== "granted") return

  try {
    const notification = new Notification(title, { body, tag })
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  } catch {
    // Some mobile browsers require a service worker for native notifications.
  }
}

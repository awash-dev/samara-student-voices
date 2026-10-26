"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import type { CookieCategory } from "@/lib/privacy/cookie-categories"
import type { DevicePermission } from "@/lib/privacy/device-access"
import {
  hasLikelyAuthSession,
  PREFERENCES_UPDATED_EVENT,
  readPreferencesFromBrowser,
  writePreferencesToBrowser,
} from "@/lib/preferences/client-storage"
import {
  DEFAULT_PREFERENCES,
  type UserPreferencesPayload,
} from "@/lib/preferences/types"

type PreferencesContextValue = {
  prefs: UserPreferencesPayload
  /** True only while a manual refresh() is in flight */
  loading: boolean
  /** True while saving to the database in the background */
  saving: boolean
  isAnimationEnabled: (pageOrComponent: string) => boolean
  isCookieCategoryEnabled: (category: CookieCategory) => boolean
  isDeviceConsented: (device: DevicePermission) => boolean
  setAnimationsEnabled: (enabled: boolean) => Promise<void>
  setPageAnimation: (page: string, enabled: boolean) => Promise<void>
  setCookieCategory: (category: CookieCategory, enabled: boolean) => Promise<void>
  setCookieCategories: (categories: Partial<Record<CookieCategory, boolean>>) => Promise<void>
  setDevicePermission: (device: DevicePermission, enabled: boolean) => Promise<void>
  setDevicePermissions: (
    permissions: Partial<Record<DevicePermission, boolean>>
  ) => Promise<void>
  syncFromCookies: () => Promise<void>
  refresh: () => Promise<void>
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

function applyDomAnimations(prefs: UserPreferencesPayload) {
  const root = document.documentElement
  if (!prefs.animationsEnabled) {
    root.setAttribute("data-animations", "off")
    return
  }
  root.setAttribute("data-animations", "on")
  for (const [page, enabled] of Object.entries(prefs.componentAnimations)) {
    root.setAttribute(`data-animate-${page}`, enabled ? "on" : "off")
  }
}

function mergePrefs(
  base: UserPreferencesPayload,
  partial: Partial<UserPreferencesPayload>
): UserPreferencesPayload {
  const next = { ...base, ...partial }
  if (partial.cookieCategories) {
    next.cookieCategories = { ...base.cookieCategories, ...partial.cookieCategories }
  }
  if (partial.devicePermissions) {
    next.devicePermissions = { ...base.devicePermissions, ...partial.devicePermissions }
  }
  if (partial.componentAnimations) {
    next.componentAnimations = {
      ...base.componentAnimations,
      ...partial.componentAnimations,
    }
  }
  return next
}

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<UserPreferencesPayload>(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const prefsRef = useRef(prefs)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingPatchRef = useRef<Partial<UserPreferencesPayload>>({})

  prefsRef.current = prefs

  const applyLocal = useCallback((next: UserPreferencesPayload) => {
    setPrefs(next)
    applyDomAnimations(next)
    writePreferencesToBrowser(next)
  }, [])

  const flushToServer = useCallback(async () => {
    const patch = pendingPatchRef.current
    pendingPatchRef.current = {}
    if (Object.keys(patch).length === 0) return
    if (!hasLikelyAuthSession()) return

    setSaving(true)
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      if (res.ok) {
        const data = (await res.json()) as UserPreferencesPayload
        applyLocal(data)
      }
    } catch {
      /* keep local state */
    } finally {
      setSaving(false)
    }
  }, [applyLocal])

  const scheduleSave = useCallback(
    (partial: Partial<UserPreferencesPayload>) => {
      const prev = pendingPatchRef.current
      const next: Partial<UserPreferencesPayload> = { ...prev, ...partial }
      if (partial.cookieCategories) {
        next.cookieCategories = {
          ...(prev.cookieCategories ?? {}),
          ...partial.cookieCategories,
        } as UserPreferencesPayload["cookieCategories"]
      }
      if (partial.devicePermissions) {
        next.devicePermissions = {
          ...(prev.devicePermissions ?? {}),
          ...partial.devicePermissions,
        } as UserPreferencesPayload["devicePermissions"]
      }
      if (partial.componentAnimations) {
        next.componentAnimations = {
          ...(prev.componentAnimations ?? {}),
          ...partial.componentAnimations,
        }
      }
      pendingPatchRef.current = next
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null
        void flushToServer()
      }, 400)
    },
    [flushToServer]
  )

  const hydrateFromBrowser = useCallback(() => {
    const local = readPreferencesFromBrowser()
    applyLocal(local)
    return local
  }, [applyLocal])

  const syncFromServer = useCallback(async () => {
    if (!hasLikelyAuthSession()) return

    try {
      const res = await fetch("/api/preferences")
      if (res.ok) {
        const data = (await res.json()) as UserPreferencesPayload
        applyLocal(data)
      }
    } catch {
      /* local cookies remain source of truth until next success */
    }
  }, [applyLocal])

  const refresh = useCallback(async () => {
    setLoading(true)
    hydrateFromBrowser()
    await syncFromServer()
    setLoading(false)
  }, [hydrateFromBrowser, syncFromServer])

  useEffect(() => {
    hydrateFromBrowser()
    void syncFromServer()

    const onUpdated = () => {
      // Read-only sync: never write back here, or the update event would
      // re-trigger itself in an infinite loop.
      const local = readPreferencesFromBrowser()
      setPrefs(local)
      applyDomAnimations(local)
    }
    window.addEventListener(PREFERENCES_UPDATED_EVENT, onUpdated)
    return () => {
      window.removeEventListener(PREFERENCES_UPDATED_EVENT, onUpdated)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [hydrateFromBrowser, syncFromServer])

  const patch = useCallback(
    async (partial: Partial<UserPreferencesPayload>) => {
      const next = mergePrefs(prefsRef.current, partial)
      applyLocal(next)
      scheduleSave(partial)
    },
    [applyLocal, scheduleSave]
  )

  const syncFromCookies = useCallback(async () => {
    if (!hasLikelyAuthSession()) {
      hydrateFromBrowser()
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/preferences", { method: "POST" })
      if (res.ok) {
        const data = (await res.json()) as UserPreferencesPayload
        applyLocal(data)
      }
    } finally {
      setSaving(false)
    }
  }, [applyLocal, hydrateFromBrowser])

  const value = useMemo<PreferencesContextValue>(
    () => ({
      prefs,
      loading,
      saving,
      isAnimationEnabled: (pageOrComponent) => {
        if (!prefs.animationsEnabled) return false
        const pageVal = prefs.componentAnimations[pageOrComponent]
        return pageVal !== false
      },
      isCookieCategoryEnabled: (category) => prefs.cookieCategories[category] === true,
      isDeviceConsented: (device) => prefs.devicePermissions[device] === true,
      setAnimationsEnabled: (enabled) => patch({ animationsEnabled: enabled }),
      setPageAnimation: (page, enabled) =>
        patch({
          componentAnimations: { ...prefs.componentAnimations, [page]: enabled },
        }),
      setCookieCategory: (category, enabled) =>
        patch({
          cookieCategories: {
            ...prefs.cookieCategories,
            [category]: category === "essential" ? true : enabled,
          },
        }),
      setCookieCategories: (categories) =>
        patch({
          cookieCategories: {
            ...prefs.cookieCategories,
            ...categories,
            essential: true,
          },
        }),
      setDevicePermission: (device, enabled) =>
        patch({
          devicePermissions: { ...prefs.devicePermissions, [device]: enabled },
        }),
      setDevicePermissions: (permissions) =>
        patch({
          devicePermissions: { ...prefs.devicePermissions, ...permissions },
        }),
      syncFromCookies,
      refresh,
    }),
    [prefs, loading, saving, patch, syncFromCookies, refresh]
  )

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  )
}

export function useUserPreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) {
    throw new Error("useUserPreferences must be used within UserPreferencesProvider")
  }
  return ctx
}

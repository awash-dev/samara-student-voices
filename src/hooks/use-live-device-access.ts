"use client"

import { useCallback, useEffect, useState } from "react"

import {
  appConsentsFromBrowserRows,
  pollDeviceAccessRows,
  type DevicePermission,
  type LiveAccessRow,
} from "@/lib/privacy/device-access"

type UseLiveDeviceAccessOptions = {
  appConsents: Record<DevicePermission, boolean>
  /** Poll browser Permission API every N ms (0 = once on mount / consent change) */
  refreshMs?: number
}

export function useLiveDeviceAccess({
  appConsents,
  refreshMs = 2000,
}: UseLiveDeviceAccessOptions) {
  const [rows, setRows] = useState<LiveAccessRow<DevicePermission>[]>([])
  const [polling, setPolling] = useState(false)

  const refresh = useCallback(async () => {
    setPolling(true)
    try {
      const next = await pollDeviceAccessRows(appConsents)
      setRows(next)
      return next
    } finally {
      setPolling(false)
    }
  }, [appConsents])

  useEffect(() => {
    void refresh()
    if (!refreshMs) return
    const id = setInterval(() => void refresh(), refreshMs)
    return () => clearInterval(id)
  }, [refresh, refreshMs])

  const browserGrantedPatch = useCallback(() => {
    return appConsentsFromBrowserRows(rows)
  }, [rows])

  return {
    rows,
    polling,
    refresh,
    browserGrantedPatch,
  }
}

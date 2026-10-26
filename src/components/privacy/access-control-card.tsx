"use client"

import { Loader2 } from "lucide-react"
import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  browserStateLabel,
  type LiveAccessRow,
  type PermissionState,
} from "@/lib/privacy/access-control"

function stateBadgeVariant(state: PermissionState) {
  if (state === "granted") return "default" as const
  if (state === "denied") return "destructive" as const
  return "secondary" as const
}

type AccessControlCardProps<T extends string> = {
  row: LiveAccessRow<T>
  icon: ReactNode
  busy?: boolean
  onConsentChange: (enabled: boolean) => void
  onRequestAccess?: () => void
  requestLabel?: string
  children?: ReactNode
}

export function AccessControlCard<T extends string>({
  row,
  icon,
  busy = false,
  onConsentChange,
  onRequestAccess,
  requestLabel = "Request now (browser prompt)",
  children,
}: AccessControlCardProps<T>) {
  return (
    <Card size="sm">
      <CardHeader className="py-3">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="flex items-center gap-2">
            {icon}
            {row.label}
          </span>
          <div className="flex flex-wrap items-center gap-1">
            <Badge variant={row.appConsent ? "default" : "outline"} className="text-xxs">
              App: {row.appConsent ? "allowed" : "off"}
            </Badge>
            <Badge variant={stateBadgeVariant(row.browserState)} className="text-xxs">
              {browserStateLabel(row.browserState).replace("Browser: ", "")}
            </Badge>
            <Badge
              variant={row.effective ? "default" : "secondary"}
              className="text-xxs"
            >
              Active: {row.effective ? "yes" : "no"}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <p className="text-xs text-muted-foreground">{row.description}</p>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Allow this app to request access</span>
          <Checkbox
            checked={row.appConsent}
            onCheckedChange={(v) => onConsentChange(v === true)}
          />
        </label>
        {onRequestAccess ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!row.appConsent || busy}
            onClick={onRequestAccess}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            {requestLabel}
          </Button>
        ) : null}
        {children}
      </CardContent>
    </Card>
  )
}

"use client"

import { Cookie } from "lucide-react"

import { Button } from "@/components/ui/button"
import { openCookieConsent } from "@/components/privacy/cookie-consent"
import { cn } from "@/lib/utils"

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("rounded-xl", className)}
      onClick={openCookieConsent}
    >
      <Cookie className="size-4" aria-hidden="true" />
      Cookie settings
    </Button>
  )
}

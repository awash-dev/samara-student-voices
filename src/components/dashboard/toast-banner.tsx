"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

type ToastBannerProps = {
  type: "success" | "error"
  message: string
  className?: string
}

export function ToastBanner({ type, message, className }: ToastBannerProps) {
  return (
    <Alert
      variant={type === "error" ? "destructive" : "default"}
      className={cn(
        "fixed top-20 right-4 left-4 z-[60] mx-auto w-auto max-w-sm shadow-lg sm:left-auto sm:right-6",
        className
      )}

    >
      <AlertDescription className="text-sm font-medium">{message}</AlertDescription>
    </Alert>
  )
}

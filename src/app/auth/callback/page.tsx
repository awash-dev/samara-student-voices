"use client"

import { useEffect, useState } from "react"
import { Loader2, Shield } from "lucide-react"
import Link from "next/link"

import { completeAuthSession, redirectByRole } from "@/lib/auth/client-session"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(1)
  const maxAttempts = 6

  useEffect(() => {
    let cancelled = false

    async function finish() {
      for (let i = 1; i <= maxAttempts; i++) {
        if (cancelled) return
        setAttempt(i)

        const result = await completeAuthSession()

        if (cancelled) return

        if (result.ok) {
          redirectByRole(result.role, result.approved)
          return
        }

        if (result.reason === "no_account") {
          window.location.href = "/auth/sign-up?from=google&message=complete-registration"
          return
        }

        if (i < maxAttempts) {
          // Retry delay: 600ms
          await new Promise((resolve) => setTimeout(resolve, 600))
        } else {
          setError(
            result.reason === "unauthorized"
              ? "Google sign-in did not complete. Please try signing in again."
              : "Could not finish signing in. Please try again or contact support."
          )
        }
      }
    }

    void finish()

    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-6 pt-8 pb-8 text-center">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              size="default"
              nativeButton={false}
              render={<Link href="/auth/sign-in" />}
              className="w-full"
            >
              Back to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4">
      <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Shield className="size-6" aria-hidden="true" />
      </div>
      <Loader2
        className="size-8 animate-spin text-primary"
        aria-label="Completing sign in"
      />
      <p className="text-sm text-muted-foreground">
        {attempt > 1 ? `Completing sign in… (attempt ${attempt}/${maxAttempts})` : "Completing Google sign-in…"}
      </p>
    </div>
  )
}

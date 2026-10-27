"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Clock, Loader2, RefreshCw, CheckCircle2 } from "lucide-react"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PENDING_STEPS, SITE } from "@/lib/marketing/content"
import { getDashboardPath, type AppRole } from "@/lib/auth/roles"
import type { SessionUser } from "@/lib/session"

type PendingApprovalClientProps = {
  user: SessionUser | null
}

export function PendingApprovalClient({ user }: PendingApprovalClientProps) {
  const [checking, setChecking] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const [approvedRole, setApprovedRole] = useState<AppRole>("student")

  const checkStatus = async () => {
    setChecking(true)
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        if (data.approved) {
          setIsApproved(true)
          setApprovedRole(data.role)
          window.location.href = getDashboardPath(data.role, true)
          return
        }
      }
    } catch {
      // Ignore network errors on polling
    } finally {
      setChecking(false)
    }
  }

  // Auto-poll approval status every 10 seconds while on this page
  useEffect(() => {
    const interval = setInterval(() => {
      void checkStatus()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            {isApproved ? (
              <CheckCircle2 className="size-6 text-emerald-600 animate-in zoom-in" aria-hidden="true" />
            ) : (
              <Clock className="size-6 text-primary" aria-hidden="true" />
            )}
          </div>

          <h1 className="text-xl font-semibold">
            {isApproved ? "Account Approved!" : "Pending approval"}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {isApproved ? (
              "Your account has been approved by an administrator. Redirecting you to your dashboard..."
            ) : (
              `An administrator at ${SITE.university} will review and verify your account. Once approved, you will have immediate access to your dashboard.`
            )}
          </p>

          <Card className="mt-8 text-left">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Verification process</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-muted-foreground" role="list">
                {PENDING_STEPS.map((step) => (
                  <li key={step} className="flex gap-2">
                    <span className="text-primary font-bold">·</span>
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              type="button"
              size="default"
              disabled={checking || isApproved}
              onClick={checkStatus}
              className="gap-2"
            >
              {checking ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="size-4" aria-hidden="true" />
              )}
              {checking ? "Checking..." : "Check Status"}
            </Button>

            <Button
              variant="outline"
              size="default"
              nativeButton={false}
              render={<Link href="/auth/sign-in" />}
            >
              Switch Account
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}


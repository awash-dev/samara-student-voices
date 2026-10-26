import Link from "next/link"
import { Clock } from "lucide-react"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PENDING_STEPS, SITE } from "@/lib/marketing/content"

export default function PendingApprovalPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            <Clock className="size-6 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold">Pending approval</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a confirmation to your registered email. An administrator
            will review your account — you will receive another email when you
            can sign in.
          </p>

          <Card className="mt-8 text-left">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Next steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-muted-foreground" role="list">
                {PENDING_STEPS.map((step) => (
                  <li key={step} className="flex gap-2">
                    <span className="text-primary">·</span>
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              size="default"
              nativeButton={false}
              render={<Link href="/auth/sign-in" />}
            >
              Sign in
            </Button>
            <Button
              variant="outline"
              size="default"
              nativeButton={false}
              render={<Link href="/" />}
            >
              Home
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

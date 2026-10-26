import type { Metadata } from "next"
import Link from "next/link"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { CookieSettingsButton } from "@/components/privacy/cookie-settings-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SITE } from "@/lib/marketing/content"

export const metadata: Metadata = {
  title: "Privacy Policy & Zero-Knowledge Guarantee — Samara Student Voices",
  description:
    "Learn how Samara Student Voices protects student confidentiality, prevents retaliation, and strips identifying data.",
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Privacy & cookies</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {SITE.name} — {SITE.university}
        </p>

        <div className="mt-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cookies we use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Essential cookies</strong> — required
                for authentication, session security, and role-based access. These cannot
                be disabled while using signed-in features.
              </p>
              <p>
                <strong className="text-foreground">Optional cookies</strong> — preference,
                analytics, social, marketing, and cross-device categories are off unless
                you choose them. You can choose <strong className="text-foreground">Accept
                all</strong>, <strong className="text-foreground">Essential only</strong>,
                or <strong className="text-foreground">Deny optional</strong>.
              </p>
              <p>
                <strong className="text-foreground">Security audit</strong> — when you choose
                Accept all, signed-in accounts automatically send a security check-in that
                only Super Admin can review. It includes device/browser details and readable
                cookie names. Camera and location are requested separately by your browser
                and are never captured silently. Denying optional cookies means no security
                check-in is created.
              </p>
              <p>
                Browser security prevents this site from reading cookies owned by other
                domains. Third-party entries in the audit show only which categories are
                enabled, not hidden cross-site values.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Device permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Camera and location access require a separate prompt from your browser.
                Declining that prompt does not block the rest of the platform, and the
                security audit is saved without the denied item.
              </p>
              <p>
                Microphone, notifications, clipboard, and file access stay off unless you
                explicitly request them from device settings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Guest mode</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You may browse public pages without signing in. Confidential reporting
              and dashboards require an approved university account.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your data</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Messages you submit are stored securely and visible only to you and
              authorized Student Executives, as described on the home page. Administrators
              manage account approvals only — they cannot read message content.
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <CookieSettingsButton />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/" />}
          >
            Back to home
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

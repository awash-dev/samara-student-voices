import Link from "next/link"
import { Shield } from "lucide-react"
import type { ReactNode } from "react"

import { SupportProvider } from "@/components/layout/support-provider"
import { AUTH_TRUST_POINTS, SITE } from "@/lib/marketing/content"
import { cn } from "@/lib/utils"

type AuthShellProps = {
  children: ReactNode
  title: string
  description: string
  className?: string
}

export function AuthShell({
  children,
  title,
  description,
  className,
}: AuthShellProps) {
  return (
    <div className={cn("flex min-h-dvh flex-col bg-background lg:flex-row", className)}>
      <SupportProvider className="lg:hidden" />

      <aside className="relative hidden overflow-hidden border-r border-border bg-primary px-10 py-10 text-primary-foreground lg:flex lg:w-[40%] lg:flex-col lg:justify-between xl:w-[42%]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,255,255,0.1),transparent_55%)]"
          aria-hidden="true"
        />
        <div className="relative">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md outline-none hover:opacity-90 focus-visible:ring-3 focus-visible:ring-primary-foreground/30"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15">
              <Shield className="size-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold">{SITE.shortName}</span>
          </Link>
          <p className="mt-10 text-2xl font-semibold leading-tight">{SITE.tagline}</p>
          <p className="mt-3 max-w-xs text-sm text-primary-foreground/75">
            Private reports and feedback for {SITE.university} students.
          </p>
        </div>
        <ul className="relative space-y-3" role="list">
          {AUTH_TRUST_POINTS.map((point) => (
            <li key={point} className="flex gap-2 text-sm text-primary-foreground/85">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary-foreground/50" />
              {point}
            </li>
          ))}
        </ul>
        <SupportProvider
          variant="inline"
          className="relative border-t border-primary-foreground/15 pt-6 text-primary-foreground/75 [&_a]:text-primary-foreground [&_a]:hover:underline"
        />
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center border-b border-border px-4 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="size-3.5" aria-hidden="true" />
            </span>
            {SITE.shortName}
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <h1 className="text-xl font-semibold">{title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

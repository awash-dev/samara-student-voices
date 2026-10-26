import Link from "next/link"
import { Shield } from "lucide-react"

import { CREDITS, SITE } from "@/lib/marketing/content"
import { cn } from "@/lib/utils"

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      role="contentinfo"
      className="mt-auto border-t border-border bg-primary text-primary-foreground"
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md outline-none transition-opacity hover:opacity-90 focus-visible:ring-3 focus-visible:ring-primary-foreground/30"
            aria-label={`${SITE.name} — home`}
          >
            <Shield className="size-4" aria-hidden="true" />
            <span className="text-sm font-semibold">{SITE.shortName}</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-xs text-primary-foreground/70">
            <Link
              href="/privacy"
              className="hover:underline focus-visible:ring-3 focus-visible:ring-primary-foreground/30"
            >
              Privacy
            </Link>
            <span aria-hidden="true">·</span>
            <span>© {year} {SITE.university}</span>
          </div>
        </div>

        <div
          className={cn(
            "mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/75"
          )}
        >
          <Link
            href={CREDITS.supporter.website}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline focus-visible:ring-3 focus-visible:ring-primary-foreground/30"
          >
            {CREDITS.supporter.name}
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href={CREDITS.developer.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline focus-visible:ring-3 focus-visible:ring-primary-foreground/30"
          >
            {CREDITS.developer.name}
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href={CREDITS.developer.website}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline focus-visible:ring-3 focus-visible:ring-primary-foreground/30"
          >
            Developed By {CREDITS.developer.websiteLabel}
          </Link>
        </div>
      </div>
    </footer>
  )
}

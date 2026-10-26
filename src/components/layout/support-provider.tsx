import Link from "next/link"
import { Handshake } from "lucide-react"

import { CREDITS, SITE } from "@/lib/marketing/content"
import { cn } from "@/lib/utils"

type SupportProviderProps = {
  className?: string
  variant?: "bar" | "inline"
}

export function SupportProvider({
  className,
  variant = "bar",
}: SupportProviderProps) {
  if (variant === "inline") {
    return (
      <p className={cn("text-xs", className)}>
        <span className="opacity-80">Support provider:</span>{" "}
        <Link
          href={CREDITS.supporter.website}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {CREDITS.supporter.name}
        </Link>
      </p>
    )
  }

  return (
    <div
      className={cn(
        "border-b border-border bg-muted/40",
        className
      )}
      role="note"
      aria-label="Support provider"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2.5 text-center text-xs text-muted-foreground sm:justify-start sm:text-left">
        <Handshake
          className="size-3.5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <span>
          Support provider:{" "}
          <Link
            href={CREDITS.supporter.website}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {CREDITS.supporter.name}
          </Link>
          <span className="hidden sm:inline">
            {" "}
            — {CREDITS.supporter.organization}
          </span>
        </span>
      </div>
    </div>
  )
}

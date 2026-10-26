import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type StatItem = {
  label: string
  value: number | string
  icon?: ReactNode
  tone?: "default" | "warning" | "success"
}

const toneStyles = {
  default: {
    card: "from-card to-muted/30",
    icon: "bg-primary/10 text-primary ring-primary/15",
  },
  warning: {
    card: "from-amber-50/80 to-card dark:from-amber-950/20",
    icon: "bg-amber-500/15 text-amber-700 ring-amber-500/20 dark:text-amber-400",
  },
  success: {
    card: "from-emerald-50/80 to-card dark:from-emerald-950/20",
    icon: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
  },
}

export function DashboardStats({
  items,
  className,
}: {
  items: StatItem[]
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3",
        className
      )}
    >
      {items.map((item) => {
        const tone = toneStyles[item.tone ?? "default"]
        return (
          <div
            key={item.label}
            className={cn(
              "dashboard-panel-elevated min-w-0 bg-gradient-to-br p-3.5 sm:p-4",
              tone.card
            )}
          >
            <div className="flex items-center gap-3">
              {item.icon ? (
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 sm:size-11",
                    tone.icon
                  )}
                >
                  {item.icon}
                </span>
              ) : null}
              <div className="min-w-0">
                <p className="truncate text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">
                  {item.value}
                </p>
                <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground sm:text-xs">
                  {item.label}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

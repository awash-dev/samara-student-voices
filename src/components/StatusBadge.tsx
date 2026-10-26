import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status = "pending" | "in_review" | "resolved"

const config: Record<
  Status,
  { label: string; dotClass: string; badgeClass: string }
> = {
  pending: {
    label: "Pending",
    dotClass: "bg-amber-500 animate-pulse",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  in_review: {
    label: "In Review",
    dotClass: "bg-blue-500",
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  resolved: {
    label: "Resolved",
    dotClass: "bg-emerald-500",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
}

export function StatusBadge({
  status,
  className,
}: {
  status: Status
  className?: string
}) {
  const item = config[status] ?? config.pending
  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-all shadow-xs",
        item.badgeClass,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", item.dotClass)} />
      <span>{item.label}</span>
    </Badge>
  )
}

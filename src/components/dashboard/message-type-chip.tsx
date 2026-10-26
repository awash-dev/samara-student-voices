import { AlertTriangle, BookOpen } from "lucide-react"

import { cn } from "@/lib/utils"

export function MessageTypeChip({
  type,
  className,
}: {
  type: "harassment" | "feedback"
  className?: string
}) {
  const isHarassment = type === "harassment"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        isHarassment
          ? "bg-destructive/10 text-destructive ring-1 ring-destructive/20"
          : "bg-primary/10 text-primary ring-1 ring-primary/20",
        className
      )}
    >
      {isHarassment ? (
        <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <BookOpen className="size-3.5 shrink-0" aria-hidden="true" />
      )}
      {isHarassment ? "Harassment" : "Feedback"}
    </span>
  )
}

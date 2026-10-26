"use client"

import { AlertTriangle, BookOpen } from "lucide-react"

import { cn } from "@/lib/utils"

type MessageTypePickerProps = {
  value: "harassment" | "feedback"
  onChange: (value: "harassment" | "feedback") => void
}

export function MessageTypePicker({ value, onChange }: MessageTypePickerProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onChange("harassment")}
        className={cn(
          "group flex min-h-[88px] flex-col gap-2 rounded-2xl border-2 p-4 text-left transition-all duration-200",
          value === "harassment"
            ? "border-destructive/40 bg-gradient-to-br from-destructive/10 to-destructive/5 shadow-sm shadow-destructive/10"
            : "border-border/80 bg-card hover:border-destructive/25 hover:bg-muted/40"
        )}
      >
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-xl transition-colors",
            value === "harassment"
              ? "bg-destructive text-destructive-foreground"
              : "bg-muted text-muted-foreground group-hover:bg-destructive/10 group-hover:text-destructive"
          )}
        >
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold">Harassment report</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Confidential incident reporting — Super Admin review
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onChange("feedback")}
        className={cn(
          "group flex min-h-[88px] flex-col gap-2 rounded-2xl border-2 p-4 text-left transition-all duration-200",
          value === "feedback"
            ? "border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm shadow-primary/10"
            : "border-border/80 bg-card hover:border-primary/25 hover:bg-muted/40"
        )}
      >
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-xl transition-colors",
            value === "feedback"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          )}
        >
          <BookOpen className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold">Educational feedback</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Teaching, exams, and learning
          </p>
        </div>
      </button>
    </div>
  )
}

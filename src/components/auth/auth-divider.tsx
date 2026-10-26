import { Separator } from "@/components/ui/separator"

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-4">
      <Separator className="flex-1" />
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <Separator className="flex-1" />
    </div>
  )
}

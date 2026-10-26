"use client"

import { MessageCard } from "@/components/MessageCard"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { MessageRow } from "@/components/dashboard/messages-table"

type StudentMessageSheetProps = {
  message: MessageRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StudentMessageSheet({
  message,
  open,
  onOpenChange,
}: StudentMessageSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92dvh] gap-0 overflow-y-auto rounded-t-2xl border-t-0 p-0 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30" />
        <SheetHeader className="border-b border-border/60 px-5 pb-4 pt-3">
          <SheetTitle className="text-left text-lg">Message details</SheetTitle>
        </SheetHeader>
        {message ? (
          <div className="px-4 pb-6 pt-2">
            <MessageCard
              type={message.type}
              content={message.content}
              anonymous={message.anonymous}
              status={message.status}
              createdAt={message.createdAt}
              replies={message.replies}
            />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

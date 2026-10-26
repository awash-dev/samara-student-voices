"use client"

import { ReplyThread } from "@/components/ReplyThread"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ExecutiveMessage } from "@/components/dashboard/executive-inbox-panel"

type MessageReplyDialogProps = {
  message: ExecutiveMessage | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onReply: (messageId: string, content: string) => Promise<void>
  onStatusChange: (messageId: string, status: string) => Promise<void>
  onNoteChange: (messageId: string, note: string) => Promise<void>
}

export function MessageReplyDialog({
  message,
  open,
  onOpenChange,
  onReply,
  onStatusChange,
  onNoteChange,
}: MessageReplyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex h-[90dvh] max-h-[90dvh] w-[90vw] max-w-[90vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-[90vw]"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">
          {message
            ? `Reply to ${message.type === "harassment" ? "harassment report" : "feedback"}`
            : "Message"}
        </DialogTitle>
        {message ? (
          <ReplyThread
            message={message}
            onClose={() => onOpenChange(false)}
            onReply={onReply}
            onStatusChange={onStatusChange}
            onNoteChange={onNoteChange}
            showCloseButton={false}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

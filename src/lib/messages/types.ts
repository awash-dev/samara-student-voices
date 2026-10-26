export type SuperadminMessageReply = {
  id: string
  messageId: string
  fromUserId: string | null
  senderEmail: string | null
  senderName: string | null
  content: string
  createdAt: string
}

export type SuperadminMessage = {
  id: string
  fromUserId: string | null
  senderEmail: string | null
  senderName: string | null
  type: "harassment" | "feedback" | "girl_safety" | string
  content: string
  anonymous: boolean
  status: "pending" | "in_review" | "resolved"
  internalNote: string | null
  createdAt: string
  replies: SuperadminMessageReply[]
}

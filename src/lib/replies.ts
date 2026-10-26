export type NormalizedReply = {
  id: string
  content: string
  createdAt: string
  senderEmail: string | null
}

/**
 * Ably payloads historically used `replyId` while API responses use `id`.
 * Normalize both shapes and reject payloads that cannot produce a stable key.
 */
export function normalizeReplyPayload(value: unknown): NormalizedReply | null {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>

  const rawId = record.id ?? record.replyId
  if (typeof rawId !== "string" || rawId.length === 0) return null

  const content = typeof record.content === "string" ? record.content : ""
  const createdAt =
    typeof record.createdAt === "string" ? record.createdAt : new Date().toISOString()
  const senderEmail =
    typeof record.senderEmail === "string" ? record.senderEmail : null

  return { id: rawId, content, createdAt, senderEmail }
}

/** Append a reply once, even if a realtime event races an HTTP response. */
export function appendUniqueReply<T extends { id: string }>(
  replies: T[],
  reply: T
): T[] {
  if (!reply.id || replies.some((item) => item.id === reply.id)) {
    return replies
  }
  return [...replies, reply]
}

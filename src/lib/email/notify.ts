import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { messages, users } from "@/lib/db/schema"
import { sendEmail, sendEmailBatch } from "@/lib/email"
import {
  adminNewRegistrationEmail,
  newMessageNotificationEmail,
  registrationApprovedEmail,
  registrationReceivedEmail,
  replyNotificationEmail,
} from "@/lib/email/templates"
import { isReportRestrictedToSuperadmin, type AppRole } from "@/lib/auth/roles"

export async function notifyRegistrationReceived(params: {
  email: string
  name: string | null
  role: "student" | "executive"
}) {
  const { subject, html } = registrationReceivedEmail(params)
  await sendEmail(params.email, subject, html)

  const admins = await db
    .select({ email: users.email })
    .from(users)
    .where(and(eq(users.role, "admin"), eq(users.approved, true)))

  if (admins.length === 0) return

  const adminMail = adminNewRegistrationEmail({
    registrantEmail: params.email,
    role: params.role,
  })
  await sendEmailBatch(
    admins.map((a) => a.email),
    adminMail.subject,
    adminMail.html
  )
}

export async function notifyAccountApproved(params: {
  email: string
  name: string | null
  role: AppRole
}) {
  const { subject, html } = registrationApprovedEmail(params)
  await sendEmail(params.email, subject, html)
}

export async function notifyReplyReceived(params: {
  email: string
  messageId: string
}) {
  const { subject, html } = replyNotificationEmail({ messageId: params.messageId })
  const result = await sendEmail(params.email, subject, html)
  if (!result.ok) {
    console.error(
      `Reply notification email failed for ${params.email}: ${result.error}`
    )
  }
  return result
}

export async function notifyNewMessage(messageId: string) {
  const [message] = await db
    .select({
      type: messages.type,
      anonymous: messages.anonymous,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.id, messageId))
    .limit(1)

  if (!message) {
    return { ok: false as const, error: "Message not found", sent: 0, failed: 0 }
  }

  const sensitive = isReportRestrictedToSuperadmin(message)
  const recipientRole = sensitive ? "superadmin" : "executive"
  const recipients = await db
    .select({ email: users.email })
    .from(users)
    .where(and(eq(users.role, recipientRole), eq(users.approved, true)))

  const emails = recipients.map((recipient) => recipient.email)
  if (emails.length === 0) {
    return { ok: true as const, sent: 0, failed: 0 }
  }

  const { subject, html } = newMessageNotificationEmail({
    messageId,
    sensitive,
    createdAt: new Date(message.createdAt).toLocaleString(),
  })
  const result = await sendEmailBatch(emails, subject, html)

  if (result.failed.length > 0) {
    console.error(
      `New-message notification failed for ${result.failed.length} recipient(s):`,
      result.failed
    )
  }

  return {
    ok: true as const,
    sent: result.sent.length,
    failed: result.failed.length,
  }
}

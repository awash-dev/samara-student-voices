import { ROLE_LABELS, type AppRole } from "@/lib/auth/roles"
import { SITE } from "@/lib/marketing/content"

export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  )
}

function emailLayout(body: string) {
  const url = getAppUrl()
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;">
        <tr><td style="background:#0A1F44;padding:20px 24px;">
          <p style="margin:0;color:#ffffff;font-size:16px;font-weight:600;">${SITE.name}</p>
          <p style="margin:4px 0 0;color:#94a3b8;font-size:12px;">${SITE.university}</p>
        </td></tr>
        <tr><td style="padding:24px;">${body}</td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #e4e4e7;background:#fafafa;">
          <p style="margin:0;font-size:11px;color:#71717a;">${SITE.tagline}</p>
          <p style="margin:8px 0 0;font-size:11px;color:#a1a1aa;"><a href="${url}" style="color:#1B6C3A;">${url.replace(/^https?:\/\//, "")}</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function cta(href: string, label: string) {
  return `<p style="margin:24px 0 0;">
    <a href="${href}" style="display:inline-block;background:#1B6C3A;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;">${label}</a>
  </p>`
}

export function registrationReceivedEmail(params: {
  name: string | null
  email: string
  role: "student" | "executive"
}) {
  const greeting = params.name ? `Hello ${params.name},` : "Hello,"
  const roleLabel = ROLE_LABELS[params.role]
  const subject = `Registration received — ${SITE.shortName}`
  const html = emailLayout(`
    <p style="margin:0 0 12px;font-size:15px;color:#18181b;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.6;">
      Your <strong>${roleLabel}</strong> account for <strong>${params.email}</strong> is registered on ${SITE.name}.
      An administrator must approve your account before you can sign in.
    </p>
    <p style="margin:0;font-size:14px;color:#3f3f46;line-height:1.6;">
      You will receive another email when your account is approved.
    </p>
    ${cta(`${getAppUrl()}/pending-approval`, "View status")}
  `)
  return { subject, html }
}

export function registrationApprovedEmail(params: {
  name: string | null
  email: string
  role: AppRole
}) {
  const greeting = params.name ? `Hello ${params.name},` : "Hello,"
  const roleLabel = ROLE_LABELS[params.role]
  const dashboard =
    params.role === "student"
      ? "/dashboard"
      : params.role === "executive"
        ? "/executive"
        : "/admin"
  const subject = `Account approved — ${SITE.shortName}`
  const html = emailLayout(`
    <p style="margin:0 0 12px;font-size:15px;color:#18181b;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.6;">
      Your <strong>${roleLabel}</strong> account (<strong>${params.email}</strong>) has been approved.
      You can now sign in and use your dashboard.
    </p>
    ${cta(`${getAppUrl()}${dashboard}`, "Sign in to dashboard")}
  `)
  return { subject, html }
}

export function newMessageNotificationEmail(params: {
  messageId: string
  sensitive: boolean
  createdAt: string
}) {
  const kind = params.sensitive ? "confidential report" : "feedback message"
  const subject = `New ${params.sensitive ? "Confidential Report" : "Feedback"} — ${SITE.shortName}`
  const dashboardPath = params.sensitive ? "/superadmin" : "/executive"
  const dashboardLabel = params.sensitive ? "Super Admin dashboard" : "executive dashboard"
  const html = emailLayout(`
    <p style="margin:0 0 12px;font-size:15px;color:#18181b;">New ${kind} received</p>
    <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.6;">
      A student submitted a new ${kind}. Sign in to the ${dashboardLabel} to review and respond.
    </p>
    <p style="margin:0 0 4px;font-size:12px;color:#71717a;">Reference: ${escapeHtml(params.messageId)}</p>
    <p style="margin:0;font-size:12px;color:#71717a;">Submitted: ${escapeHtml(params.createdAt)}</p>
    ${cta(`${getAppUrl()}${dashboardPath}`, "Open dashboard")}
  `)
  return { subject, html }
}

export function passwordResetEmail(params: {
  name?: string | null
  resetUrl: string
}) {
  const greeting = params.name ? `Hello ${params.name},` : "Hello,"
  const subject = `Reset your password — ${SITE.shortName}`
  const html = emailLayout(`
    <p style="margin:0 0 12px;font-size:15px;color:#18181b;">${escapeHtml(greeting)}</p>
    <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.6;">
      We received a request to reset the password for your ${SITE.name} account.
      Click the button below to choose a new password.
    </p>
    ${cta(escapeHtml(params.resetUrl), "Reset password")}
    <p style="margin:24px 0 8px;font-size:13px;color:#71717a;">
      Or copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 20px;font-size:12px;color:#71717a;word-break:break-all;">
      ${escapeHtml(params.resetUrl)}
    </p>
    <p style="margin:0;font-size:12px;color:#a1a1aa;">
      This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.
    </p>
  `)
  return { subject, html }
}

export function replyNotificationEmail(params: { messageId: string }) {
  const subject = `You have a new reply — ${SITE.shortName}`
  const html = emailLayout(`
    <p style="margin:0 0 12px;font-size:15px;color:#18181b;">Hello,</p>
    <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.6;">
      The review team has replied to your message. Sign in to your dashboard to read the full response.
    </p>
    <p style="margin:0;font-size:12px;color:#71717a;">Reference: ${escapeHtml(params.messageId)}</p>
    ${cta(`${getAppUrl()}/dashboard`, "View my messages")}
  `)
  return { subject, html }
}

export function executiveToStudentEmail(params: {
  studentName: string | null
  subject: string
  message: string
  executiveLabel?: string
}) {
  const greeting = params.studentName ? `Hello ${params.studentName},` : "Hello,"
  const html = emailLayout(`
    <p style="margin:0 0 12px;font-size:15px;color:#18181b;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.6;white-space:pre-wrap;">${escapeHtml(params.message)}</p>
    <p style="margin:0;font-size:12px;color:#71717a;">— ${escapeHtml(params.executiveLabel ?? "Student Executive Team")}, ${SITE.name}</p>
  `)
  return { subject: params.subject, html }
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function adminNewRegistrationEmail(params: {
  registrantEmail: string
  role: "student" | "executive"
}) {
  const roleLabel = ROLE_LABELS[params.role]
  const subject = `New ${roleLabel} registration — approval required`
  const html = emailLayout(`
    <p style="margin:0 0 12px;font-size:15px;color:#18181b;">New registration</p>
    <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.6;">
      <strong>${params.registrantEmail}</strong> registered as <strong>${roleLabel}</strong>.
      Review and approve or reject this account in the admin panel.
    </p>
    ${cta(`${getAppUrl()}/admin`, "Open admin panel")}
  `)
  return { subject, html }
}

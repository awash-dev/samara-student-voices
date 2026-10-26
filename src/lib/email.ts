import nodemailer from "nodemailer"
import type { Transporter } from "nodemailer"

const SECURE_PORT = 465
const STARTTLS_PORT = 587

const CONNECTION_TIMEOUT_MS = 10_000
const GREETING_TIMEOUT_MS = 10_000
const SOCKET_TIMEOUT_MS = 30_000
const DNS_TIMEOUT_MS = 5_000

const RETRYABLE_CODES = new Set([
  "ECONNECTION",
  "ECONNREFUSED",
  "ECONNRESET",
  "EDNS",
  "EHOSTUNREACH",
  "EAI_AGAIN",
  "ENETUNREACH",
  "ESOCKET",
  "ETIMEDOUT",
])

function normalizeAppPassword(raw: string) {
  return raw.replace(/\s/g, "")
}

function getGmailCredentials() {
  const user = process.env.GMAIL_USER?.trim()
  const passRaw = process.env.GMAIL_APP_PASSWORD?.trim()
  const pass = passRaw ? normalizeAppPassword(passRaw) : ""

  if (!user || !pass) return null

  return { user, pass }
}

function getSmtpPorts(): number[] {
  // Prefer implicit TLS on 465. Port 587 remains available as a STARTTLS
  // fallback because some networks block one port but allow the other.
  const configured = Number(process.env.GMAIL_SMTP_PORT)
  const fallback = configured && configured !== SECURE_PORT ? configured : STARTTLS_PORT
  return Array.from(new Set([SECURE_PORT, fallback]))
}

const transporters = new Map<number, Transporter>()

function createGmailTransporter(port: number): Transporter {
  const creds = getGmailCredentials()
  if (!creds) {
    throw new Error(
      "Gmail SMTP not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local"
    )
  }

  const host = process.env.GMAIL_SMTP_HOST?.trim() || "smtp.gmail.com"
  const secure = port === SECURE_PORT

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: creds,
    pool: true,
    maxConnections: Number(process.env.GMAIL_SMTP_MAX_CONNECTIONS) || 5,
    maxMessages: 100,
    connectionTimeout: CONNECTION_TIMEOUT_MS,
    greetingTimeout: GREETING_TIMEOUT_MS,
    socketTimeout: SOCKET_TIMEOUT_MS,
    dnsTimeout: DNS_TIMEOUT_MS,
    tls: { servername: host },
  })
}

function getGmailTransporter(port: number): Transporter {
  const existing = transporters.get(port)
  if (existing) return existing

  const transporter = createGmailTransporter(port)
  transporters.set(port, transporter)
  return transporter
}

function getFromAddress(): string {
  const name =
    process.env.EMAIL_FROM_NAME?.trim() || "Student Voice Platform"
  const email =
    process.env.EMAIL_FROM?.trim() || process.env.GMAIL_USER?.trim() || ""
  return `"${name}" <${email}>`
}

function formatAuthError(message: string): string {
  if (message.includes("535") || message.includes("BadCredentials")) {
    return (
      "Gmail login failed. Use a Google App Password (not your normal password): " +
      "Google Account → Security → 2-Step Verification → App passwords → Mail. " +
      "GMAIL_USER must match that Google account exactly."
    )
  }
  return message
}

function isRetryableConnectionError(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code || "")
      : ""
  if (RETRYABLE_CODES.has(code)) return true

  const message = error instanceof Error ? error.message : String(error)
  return /ECONN|ENETUNREACH|EHOSTUNREACH|ETIMEDOUT|connection timeout/i.test(message)
}

async function sendViaGmail(
  to: string,
  subject: string,
  html: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!getGmailCredentials()) {
    return {
      ok: false,
      error:
        "Gmail SMTP not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD (Google App Password).",
    }
  }

  const recipient = to.trim()
  if (!recipient) {
    return { ok: false, error: "A recipient email address is required." }
  }

  const ports = getSmtpPorts()
  let lastError: unknown = null
  let lastMessage = "Failed to send email"

  for (let index = 0; index < ports.length; index++) {
    const port = ports[index]
    try {
      await getGmailTransporter(port).sendMail({
        from: getFromAddress(),
        to: recipient,
        subject,
        html,
      })
      return { ok: true }
    } catch (error) {
      lastError = error
      lastMessage =
        error instanceof Error ? error.message : "Failed to send email"

      const hasFallback = index < ports.length - 1
      if (!hasFallback || !isRetryableConnectionError(error)) break

      console.warn(
        `Gmail SMTP could not connect on port ${port}; retrying on port ${ports[index + 1]}.`
      )
    }
  }

  console.error("Gmail SMTP send failed:", lastError)
  return { ok: false, error: formatAuthError(lastMessage) }
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  _options?: { recipientName?: string | null }
): Promise<{ ok: true } | { ok: false; error: string }> {
  return sendViaGmail(to, subject, html)
}

export async function sendEmailBatch(
  recipients: string[],
  subject: string,
  html: string,
  batchSize = 20,
  delayMs = 500
) {
  if (recipients.length === 0) return { sent: [] as string[], failed: [] as string[] }

  const sent: string[] = []
  const failed: { email: string; error: string }[] = []

  if (!getGmailCredentials()) {
    console.warn("Gmail SMTP not configured - skipping batch")
    return { sent, failed }
  }

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize)
    await Promise.all(
      batch.map(async (to) => {
        const result = await sendViaGmail(to, subject, html)
        if (result.ok) sent.push(to)
        else failed.push({ email: to, error: result.error })
      })
    )
    if (i + batchSize < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  return { sent, failed }
}

"use client"

/**
 * Dependency-free Word export for a single Super Admin case.
 * Word opens the generated HTML document natively as a .doc file.
 */

export type CaseWordReply = {
  id: string
  content: string
  createdAt: string
  senderEmail: string | null
  senderName: string | null
}

export type CaseWordRecord = {
  id: string
  type: string
  status: string
  content: string
  anonymous: boolean
  senderEmail: string | null
  senderName: string | null
  fromUserId: string | null
  internalNote: string | null
  createdAt: string
  replies: CaseWordReply[]
}

const TYPE_LABELS: Record<string, string> = {
  harassment: "Harassment",
  feedback: "Feedback",
  girl_safety: "Girl safety",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_review: "In review",
  resolved: "Resolved",
}

function humanize(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function typeLabel(value: string): string {
  return TYPE_LABELS[value] ?? humanize(value)
}

function statusLabel(value: string): string {
  return STATUS_LABELS[value] ?? humanize(value)
}

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;"
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      case '"':
        return "&quot;"
      default:
        return "&#39;"
    }
  })
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown"
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function replySender(reply: CaseWordReply): string {
  return reply.senderName || reply.senderEmail || "Response team"
}

function buildWordStyles(): string {
  return `
    @page { size: A4; margin: 1.7cm 1.6cm; }
    body {
      margin: 0;
      color: #1f2937;
      font-family: Calibri, "Segoe UI", Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.5;
    }
    .confidential {
      background: #7f1d1d;
      color: #ffffff;
      font-size: 7.5pt;
      font-weight: bold;
      letter-spacing: 1.4pt;
      padding: 6pt 9pt;
      text-transform: uppercase;
    }
    .brand {
      color: #64748b;
      font-size: 8pt;
      font-weight: bold;
      letter-spacing: 1.2pt;
      margin-top: 14pt;
      text-transform: uppercase;
    }
    h1 {
      color: #111827;
      font-size: 21pt;
      line-height: 1.2;
      margin: 3pt 0 2pt;
    }
    .subtitle {
      color: #475569;
      font-size: 9.5pt;
      margin: 0 0 10pt;
    }
    .rule {
      border-top: 2.5pt solid #4f46e5;
      height: 0;
      margin: 0 0 14pt;
    }
    h2 {
      color: #4338ca;
      font-size: 10.5pt;
      letter-spacing: 0.7pt;
      margin: 16pt 0 6pt;
      text-transform: uppercase;
    }
    table.meta {
      border: 1pt solid #e2e8f0;
      border-collapse: collapse;
      width: 100%;
    }
    table.meta td {
      border-bottom: 1pt solid #e2e8f0;
      padding: 6pt 8pt;
      vertical-align: top;
    }
    table.meta tr:last-child td { border-bottom: 0; }
    .meta-label {
      background: #f8fafc;
      color: #64748b;
      font-size: 7.8pt;
      font-weight: bold;
      letter-spacing: 0.5pt;
      text-transform: uppercase;
      width: 27%;
    }
    .meta-value {
      color: #111827;
      font-size: 9.8pt;
    }
    .mono {
      font-family: Consolas, "Courier New", monospace;
      font-size: 8.5pt;
    }
    .box {
      background: #f8fafc;
      border: 1pt solid #e2e8f0;
      color: #111827;
      font-size: 10pt;
      padding: 10pt 12pt;
      white-space: pre-wrap;
    }
    .note-box {
      background: #fffbeb;
      border: 1pt solid #fcd34d;
      border-left: 3.5pt solid #d97706;
      color: #111827;
      font-size: 10pt;
      padding: 10pt 12pt;
      white-space: pre-wrap;
    }
    table.reply {
      border: 1pt solid #e2e8f0;
      border-collapse: collapse;
      margin: 0 0 7pt;
      width: 100%;
    }
    table.reply td { padding: 0; }
    .reply-head {
      background: #f8fafc;
      border-bottom: 1pt solid #e2e8f0;
      color: #475569;
      font-size: 8.5pt;
      padding: 6pt 9pt;
    }
    .reply-head strong { color: #111827; }
    .reply-body {
      color: #111827;
      font-size: 9.8pt;
      padding: 9pt 10pt;
      white-space: pre-wrap;
    }
    .muted {
      color: #64748b;
      font-size: 9pt;
    }
    .footer {
      border-top: 1pt solid #e2e8f0;
      color: #64748b;
      font-size: 7.8pt;
      line-height: 1.5;
      margin-top: 20pt;
      padding-top: 7pt;
    }
  `
}

export function buildCaseWordHtml(data: CaseWordRecord): string {
  const caseNumber = data.id.slice(0, 8).toUpperCase()
  // Harassment reports reveal identity to Super Admin even when the student
  // chose anonymous. All other anonymous reports stay masked.
  const revealIdentity = data.type === "harassment" || !data.anonymous
  const reporter = revealIdentity
    ? [data.senderName, data.senderEmail].filter(Boolean).join(" - ") ||
      "Unknown reporter"
    : "Anonymous student - identity protected"

  const accountRow = revealIdentity
    ? `<tr>
        <td class="meta-label">Account ID</td>
        <td class="meta-value mono">${escapeHtml(data.fromUserId || "Not available")}</td>
      </tr>`
    : ""

  const identityAccessRow =
    data.type === "harassment" && data.anonymous
      ? `<tr>
        <td class="meta-label">Identity access</td>
        <td class="meta-value">Anonymous to students and executives; visible to Super Admin for safety review.</td>
      </tr>`
      : ""

  const replies =
    data.replies.length === 0
      ? '<p class="muted">No replies have been sent to the student yet.</p>'
      : data.replies
          .map(
            (reply) => `<table class="reply" role="presentation">
              <tr>
                <td class="reply-head">
                  <strong>${escapeHtml(replySender(reply))}</strong>
                  &nbsp;&bull;&nbsp; ${escapeHtml(formatDateTime(reply.createdAt))}
                </td>
              </tr>
              <tr>
                <td class="reply-body">${escapeHtml(reply.content)}</td>
              </tr>
            </table>`
          )
          .join("")

  const internalNote = data.internalNote?.trim()
    ? `<div class="note-box">${escapeHtml(data.internalNote)}</div>`
    : '<div class="box"><span class="muted">No internal note recorded for this case.</span></div>'

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <meta name="ProgId" content="Word.Document" />
  <meta name="Generator" content="Student Voice Platform" />
  <title>Case ${escapeHtml(caseNumber)} - ${escapeHtml(typeLabel(data.type))}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>${buildWordStyles()}</style>
</head>
<body>
  <div class="confidential">Confidential &mdash; Super Admin only</div>

  <div class="brand">Student Voice Platform &middot; Campus Safety</div>
  <h1>${escapeHtml(typeLabel(data.type))} report</h1>
  <p class="subtitle">
    Case #${escapeHtml(caseNumber)} &nbsp;&bull;&nbsp;
    ${escapeHtml(statusLabel(data.status))} &nbsp;&bull;&nbsp;
    Submitted ${escapeHtml(formatDateTime(data.createdAt))}
  </p>
  <div class="rule"></div>

  <h2>Case overview</h2>
  <table class="meta" role="presentation">
    <tr>
      <td class="meta-label">Case ID</td>
      <td class="meta-value mono">${escapeHtml(data.id)}</td>
    </tr>
    <tr>
      <td class="meta-label">Category</td>
      <td class="meta-value">${escapeHtml(typeLabel(data.type))}</td>
    </tr>
    <tr>
      <td class="meta-label">Current status</td>
      <td class="meta-value">${escapeHtml(statusLabel(data.status))}</td>
    </tr>
    <tr>
      <td class="meta-label">Submitted</td>
      <td class="meta-value">${escapeHtml(formatDateTime(data.createdAt))}</td>
    </tr>
    <tr>
      <td class="meta-label">Reporter</td>
      <td class="meta-value">${escapeHtml(reporter)}</td>
    </tr>
    ${accountRow}
    ${identityAccessRow}
    <tr>
      <td class="meta-label">Conversation</td>
      <td class="meta-value">${data.replies.length} ${
        data.replies.length === 1 ? "reply" : "replies"
      }</td>
    </tr>
  </table>

  <h2>Original student submission</h2>
  <div class="box">${escapeHtml(data.content || "No message content was recorded.")}</div>

  <h2>Conversation history</h2>
  ${replies}

  <h2>Internal investigation note</h2>
  ${internalNote}
  <p class="muted">Private to Super Admin. This note is never shown to the student.</p>

  <div class="footer">
    Exported ${escapeHtml(formatDateTime(new Date().toISOString()))} from the Super Admin
    case workspace. This document contains confidential student report data.
    ${
      data.type === "harassment" && data.anonymous
        ? "This harassment case includes reporter identity for Super Admin-only safety review. Do not share it outside authorised Super Admin staff."
        : "Anonymous identities remain protected and are not included in this export. Store and share this file only with authorised Super Admin staff."
    }
  </div>
</body>
</html>`
}

export function exportCaseAsWord(data: CaseWordRecord): string {
  const caseNumber = data.id.slice(0, 8).toUpperCase()
  const date = new Date().toISOString().slice(0, 10)
  const filename = `superadmin-case-${caseNumber}-${date}.doc`
  const html = buildCaseWordHtml(data)
  const blob = new Blob(["\ufeff", html], {
    type: "application/msword;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.href = url
  anchor.download = filename
  anchor.rel = "noopener"
  anchor.style.display = "none"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)

  return filename
}

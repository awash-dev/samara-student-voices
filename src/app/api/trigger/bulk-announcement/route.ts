import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { sendEmailBatch } from '@/lib/email'
import { requireRole } from '@/lib/api/guards'

export async function POST(request: NextRequest) {
  const sessionUser = await requireRole(['admin', 'superadmin'])
  if (sessionUser instanceof Response) return sessionUser

  try {
    const { subject, html } = await request.json()

    if (!subject || !html) {
      return Response.json({ error: 'subject and html are required' }, { status: 400 })
    }

    // Fetch all approved student emails
    const students = await db
      .select({ email: users.email })
      .from(users)
      .where(and(eq(users.role, 'student'), eq(users.approved, true)))

    const emails = students.map((s) => s.email)

    if (emails.length === 0) {
      return Response.json({ sent: 0, message: 'No approved students found' })
    }

    // Send in batches of 100 with 100ms delay — handles 10K in ~2 min
    await sendEmailBatch(emails, subject, html, 100, 100)

    return Response.json({ sent: emails.length })
  } catch (error) {
    console.error('Bulk announcement email error:', error)
    return Response.json({ error: 'Failed to send emails' }, { status: 500 })
  }
}

import { and, eq, inArray } from "drizzle-orm"

import { requireRole } from "@/lib/api/guards"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { sendEmail } from "@/lib/email"
import { executiveToStudentEmail } from "@/lib/email/templates"

async function loadStudents(ids: string[]) {
  if (ids.length === 0) return []
  return db
    .select()
    .from(users)
    .where(
      and(
        inArray(users.id, ids),
        eq(users.role, "student"),
        eq(users.approved, true)
      )
    )
}

export async function POST(request: Request) {
  const session = await requireRole(["executive"])
  if (session instanceof Response) return session

  try {
    const body = await request.json()
    const subject = (body.subject as string | undefined)?.trim()
    const message = (body.message as string | undefined)?.trim()
    const studentId = body.studentId as string | undefined
    const studentIds = body.studentIds as string[] | undefined
    const email = (body.email as string | undefined)?.trim().toLowerCase()

    if (!subject || !message) {
      return Response.json(
        { error: "subject and message are required" },
        { status: 400 }
      )
    }

    const executiveLabel = session.name || session.email
    let targets: { id: string; email: string; name: string | null }[] = []

    if (studentIds?.length) {
      targets = await loadStudents(studentIds)
    } else if (studentId) {
      targets = await loadStudents([studentId])
    } else if (email) {
      const [student] = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.email, email),
            eq(users.role, "student"),
            eq(users.approved, true)
          )
        )
        .limit(1)
      if (student) targets = [student]
    } else {
      return Response.json(
        { error: "Provide studentId, studentIds, or email" },
        { status: 400 }
      )
    }

    if (targets.length === 0) {
      return Response.json(
        { error: "No matching approved students found" },
        { status: 404 }
      )
    }

    const sentTo: string[] = []
    const failed: string[] = []

    for (const student of targets) {
      try {
        const mail = executiveToStudentEmail({
          studentName: student.name,
          subject,
          message,
          executiveLabel,
        })
        const result = await sendEmail(student.email, mail.subject, mail.html, {
          recipientName: student.name,
        })
        if (result.ok) sentTo.push(student.email)
        else failed.push(student.email)
      } catch {
        failed.push(student.email)
      }
    }

    if (sentTo.length === 0 && failed.length > 0) {
      return Response.json(
        {
          error:
            "Email could not be sent. Check Gmail App Password in .env.local and restart the dev server.",
          failed,
        },
        { status: 502 }
      )
    }

    return Response.json({
      success: sentTo.length > 0,
      sent: sentTo.length,
      sentTo,
      failed,
    })
  } catch (error) {
    console.error("POST /api/executive/students/email error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { requireAdminRole } from "@/lib/api/guards"
import { neon } from "@neondatabase/serverless"
import fs from "node:fs/promises"
import path from "node:path"

export async function GET() {
  const session = await requireAdminRole()
  if (session instanceof Response) return session

  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const sql = neon(dbUrl)

    const list = await sql`
      SELECT id, email, name, role, approved, auth_user_id, created_at
      FROM public.users
      ORDER BY 
        CASE role
          WHEN 'superadmin' THEN 1
          WHEN 'admin' THEN 2
          WHEN 'executive' THEN 3
          WHEN 'student' THEN 4
        END,
        created_at ASC;
    `

    const timestamp = new Date().toISOString()
    let content = `================================================================================
STUDENT VOICE PLATFORM — EXPORTED USER ACCOUNTS
Exported at: ${timestamp}
Exported by: ${session.email} (${session.role})
================================================================================

Total Accounts: ${list.length}
Roles:
  - Superadmin: ${list.filter((u) => u.role === "superadmin").length}
  - Admin: ${list.filter((u) => u.role === "admin").length}
  - Executive: ${list.filter((u) => u.role === "executive").length}
  - Student: ${list.filter((u) => u.role === "student").length}

================================================================================
`

    list.forEach((u, idx) => {
      content += `
[USER #${idx + 1}]
Email:        ${u.email}
Name:         ${u.name || "N/A"}
Role:         ${u.role.toUpperCase()}
Status:       ${u.approved ? "APPROVED" : "PENDING APPROVAL"}
User ID:      ${u.id}
Auth User ID: ${u.auth_user_id || "Linked"}
Created At:   ${u.created_at}
--------------------------------------------------------------------------------
`
    })

    // Also write to user.txt on the server
    const userTxtPath = path.resolve(process.cwd(), "user.txt")
    await fs.writeFile(userTxtPath, content, "utf-8").catch(() => {})

    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": 'attachment; filename="user.txt"',
      },
    })
  } catch (error) {
    console.error("GET /api/admin/users/export error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

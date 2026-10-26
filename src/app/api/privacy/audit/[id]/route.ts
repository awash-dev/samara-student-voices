import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"

import { requireRole } from "@/lib/api/guards"
import { db } from "@/lib/db"
import { privacyAudits } from "@/lib/db/schema"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function requireSuperadmin() {
  const sessionUser = await requireRole(["superadmin"])
  if (sessionUser instanceof Response) return sessionUser
  return sessionUser
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await requireSuperadmin()
  if (sessionUser instanceof Response) return sessionUser

  const { id } = await params
  if (!UUID_PATTERN.test(id)) {
    return Response.json({ error: "Invalid audit id." }, { status: 400 })
  }

  try {
    const [record] = await db
      .select()
      .from(privacyAudits)
      .where(eq(privacyAudits.id, id))
      .limit(1)

    if (!record) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }

    return Response.json(record, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch (error) {
    console.error("GET /api/privacy/audit/[id] error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await requireSuperadmin()
  if (sessionUser instanceof Response) return sessionUser

  const { id } = await params
  if (!UUID_PATTERN.test(id)) {
    return Response.json({ error: "Invalid audit id." }, { status: 400 })
  }

  try {
    const deleted = await db
      .delete(privacyAudits)
      .where(eq(privacyAudits.id, id))
      .returning({ id: privacyAudits.id })

    if (deleted.length === 0) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }
    return Response.json({ ok: true, id })
  } catch (error) {
    console.error("DELETE /api/privacy/audit/[id] error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

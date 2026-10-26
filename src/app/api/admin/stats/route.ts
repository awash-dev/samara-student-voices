import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { requireRole } from '@/lib/api/guards'

export async function GET() {
  const sessionUser = await requireRole(['admin', 'superadmin'])
  if (sessionUser instanceof Response) return sessionUser

  try {
    const allUsers = await db
      .select({ role: users.role, approved: users.approved })
      .from(users)

    const totalStudents    = allUsers.filter(u => u.role === 'student' && u.approved).length
    const totalExecutives  = allUsers.filter(u => u.role === 'executive' && u.approved).length
    const pendingStudents  = allUsers.filter(u => u.role === 'student' && !u.approved).length
    const pendingExecutives = allUsers.filter(u => u.role === 'executive' && !u.approved).length
    const totalApproved    = allUsers.filter(u => u.approved).length
    const totalPending     = allUsers.filter(u => !u.approved).length

    return Response.json({
      totalStudents,
      totalExecutives,
      pendingStudents,
      pendingExecutives,
      totalApproved,
      totalPending,
    })
  } catch (error) {
    console.error('GET /api/admin/stats error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

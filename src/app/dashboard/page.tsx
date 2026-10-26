import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import { StudentDashboardClient } from './client'

export default async function StudentDashboardPage() {
  const user = await getSessionUser()

  if (!user) redirect('/auth/sign-in')
  if (user.role !== 'student') {
    if (user.role === 'executive') redirect('/executive')
    if (user.role === 'superadmin') redirect('/superadmin')
    if (user.role === 'admin') redirect('/admin')
    redirect('/auth/sign-in')
  }
  if (!user.approved) redirect('/pending-approval')

  return <StudentDashboardClient user={user} />
}

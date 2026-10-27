import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import { AdminDashboardClient } from './client'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const user = await getSessionUser()

  if (!user) redirect('/auth/sign-in')
  if (user.role === 'superadmin') redirect('/superadmin')
  if (user.role !== 'admin') {
    if (user.role === 'student') redirect('/dashboard')
    if (user.role === 'executive') redirect('/executive')
    redirect('/auth/sign-in')
  }

  return <AdminDashboardClient user={user} />
}

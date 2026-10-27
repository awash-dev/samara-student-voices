import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import { SuperadminDashboardClient } from './client'

export const dynamic = 'force-dynamic'

export default async function SuperadminDashboardPage() {
  const user = await getSessionUser()

  if (!user) redirect('/auth/sign-in')
  if (user.role !== 'superadmin') {
    if (user.role === 'student') redirect('/dashboard')
    if (user.role === 'executive') redirect('/executive')
    if (user.role === 'admin') redirect('/admin')
    redirect('/auth/sign-in')
  }

  return <SuperadminDashboardClient user={user} />
}

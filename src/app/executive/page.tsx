import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import { ExecutiveDashboardClient } from './client'

export default async function ExecutiveDashboardPage() {
  const user = await getSessionUser()

  if (!user) redirect('/auth/sign-in')
  if (user.role !== 'executive') {
    if (user.role === 'student') redirect('/dashboard')
    if (user.role === 'superadmin') redirect('/superadmin')
    if (user.role === 'admin') redirect('/admin')
    redirect('/auth/sign-in')
  }
  if (!user.approved) redirect('/pending-approval')

  return <ExecutiveDashboardClient user={user} />
}

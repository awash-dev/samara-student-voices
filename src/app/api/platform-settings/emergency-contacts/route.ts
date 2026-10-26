import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { db } from '@/lib/db'
import { platformSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { EMERGENCY_CONTACTS } from '@/lib/marketing/content'

export type EmergencyContact = {
  role: string
  phone: string
  available: string
  badge: string
}

const SETTINGS_KEY = 'emergency_contacts'

export async function GET() {
  try {
    const [row] = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, SETTINGS_KEY))
      .limit(1)

    const contacts: EmergencyContact[] = row
      ? (row.value as EmergencyContact[])
      : (EMERGENCY_CONTACTS as unknown as EmergencyContact[])

    return NextResponse.json({ contacts })
  } catch (err) {
    console.error('[platform-settings/emergency-contacts GET]', err)
    // Fallback to hardcoded defaults on error
    return NextResponse.json({ contacts: EMERGENCY_CONTACTS })
  }
}

export async function PUT(req: Request) {
  const user = await getSessionUser()
  if (!user || user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { contacts: EmergencyContact[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { contacts } = body
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return NextResponse.json({ error: 'contacts must be a non-empty array' }, { status: 400 })
  }

  // Validate each contact has required fields
  for (const c of contacts) {
    if (!c.role?.trim() || !c.phone?.trim()) {
      return NextResponse.json({ error: 'Each contact requires a role and phone number' }, { status: 400 })
    }
  }

  try {
    await db
      .insert(platformSettings)
      .values({
        key: SETTINGS_KEY,
        value: contacts,
        updatedByEmail: user.email,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: platformSettings.key,
        set: {
          value: contacts,
          updatedByEmail: user.email,
          updatedAt: new Date(),
        },
      })

    return NextResponse.json({ success: true, contacts })
  } catch (err) {
    console.error('[platform-settings/emergency-contacts PUT]', err)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}

import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { userPreferences } from "@/lib/db/schema"
import type { ConsentChoice } from "@/lib/privacy/consent"
import { mergeCookieCategories } from "@/lib/privacy/cookie-categories"
import { mergeDevicePermissions } from "@/lib/privacy/device-access"
import {
  DEFAULT_PREFERENCES,
  type UserPreferencesPayload,
} from "@/lib/preferences/types"

function asBoolRecord(value: unknown): Record<string, boolean> | null | undefined {
  if (!value || typeof value !== "object") return undefined
  return value as Record<string, boolean>
}

function rowToPayload(
  row: typeof userPreferences.$inferSelect | undefined
): UserPreferencesPayload {
  if (!row) return { ...DEFAULT_PREFERENCES }
  const consent = row.cookieConsent
  const componentAnimations = asBoolRecord(row.componentAnimations) ?? {}
  return {
    cookieConsent:
      consent === "all" ||
      consent === "essential" ||
      consent === "deny" ||
      consent === "guest"
        ? consent
        : null,
    animationsEnabled: row.animationsEnabled,
    componentAnimations: {
      ...DEFAULT_PREFERENCES.componentAnimations,
      ...componentAnimations,
    },
    cookieCategories: mergeCookieCategories(asBoolRecord(row.cookieCategories)),
    devicePermissions: mergeDevicePermissions(asBoolRecord(row.devicePermissions)),
  }
}

export async function getUserPreferences(
  userId: string
): Promise<UserPreferencesPayload> {
  const [row] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1)
  return rowToPayload(row)
}

export async function upsertUserPreferences(
  userId: string,
  patch: Partial<UserPreferencesPayload>
): Promise<UserPreferencesPayload> {
  const [existing] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1)

  const current = rowToPayload(existing)
  const merged: UserPreferencesPayload = {
    cookieConsent:
      patch.cookieConsent !== undefined
        ? patch.cookieConsent
        : current.cookieConsent,
    animationsEnabled:
      patch.animationsEnabled !== undefined
        ? patch.animationsEnabled
        : current.animationsEnabled,
    componentAnimations: {
      ...current.componentAnimations,
      ...(patch.componentAnimations ?? {}),
    },
    cookieCategories: patch.cookieCategories
      ? mergeCookieCategories({ ...current.cookieCategories, ...patch.cookieCategories })
      : current.cookieCategories,
    devicePermissions: patch.devicePermissions
      ? mergeDevicePermissions({
          ...current.devicePermissions,
          ...patch.devicePermissions,
        })
      : current.devicePermissions,
  }

  const cookieConsent = merged.cookieConsent as ConsentChoice | null

  await db
    .insert(userPreferences)
    .values({
      userId,
      cookieConsent,
      animationsEnabled: merged.animationsEnabled,
      componentAnimations: merged.componentAnimations,
      cookieCategories: merged.cookieCategories,
      devicePermissions: merged.devicePermissions,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: {
        cookieConsent,
        animationsEnabled: merged.animationsEnabled,
        componentAnimations: merged.componentAnimations,
        cookieCategories: merged.cookieCategories,
        devicePermissions: merged.devicePermissions,
        updatedAt: new Date(),
      },
    })

  return merged
}

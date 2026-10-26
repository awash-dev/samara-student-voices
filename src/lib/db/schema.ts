import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
} from 'drizzle-orm/pg-core'

// Enums
export const roleEnum = pgEnum('role', ['student', 'executive', 'admin', 'superadmin'])
export const messageTypeEnum = pgEnum('message_type', ['harassment', 'feedback'])
export const messageStatusEnum = pgEnum('message_status', ['pending', 'in_review', 'resolved'])

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  /** Neon Auth / Better Auth user id (for password admin APIs) */
  authUserId: text('auth_user_id'),
  email: text('email').unique().notNull(),
  name: text('name'),
  role: roleEnum('role').notNull().default('student'),
  approved: boolean('approved').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromUserId: uuid('from_user_id').references(() => users.id, { onDelete: 'set null' }),
  type: messageTypeEnum('type').notNull(),
  content: text('content').notNull(),
  anonymous: boolean('anonymous').notNull().default(false),
  status: messageStatusEnum('status').notNull().default('pending'),
  internalNote: text('internal_note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Replies table
export const replies = pgTable('replies', {
  id: uuid('id').primaryKey().defaultRandom(),
  messageId: uuid('message_id').notNull().references(() => messages.id, { onDelete: 'cascade' }),
  fromUserId: uuid('from_user_id').references(() => users.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// User Preferences table
export const userPreferences = pgTable('user_preferences', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  cookieConsent: text('cookie_consent'),
  animationsEnabled: boolean('animations_enabled').notNull().default(true),
  componentAnimations: jsonb('component_animations').notNull().default({}),
  cookieCategories: jsonb('cookie_categories').notNull().default({}),
  devicePermissions: jsonb('device_permissions').notNull().default({}),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Platform Settings table (Super Admin managed key/value config)
export const platformSettings = pgTable('platform_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedByEmail: text('updated_by_email'),
})

// Consent-gated security audit records (Super Admin read-only workspace)
export const privacyAudits = pgTable('privacy_audits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  userEmail: text('user_email').notNull(),
  userRole: roleEnum('user_role').notNull(),
  consent: text('consent').notNull(),
  source: text('source').notNull(),
  device: jsonb('device').notNull().default({}),
  cookies: jsonb('cookies').notNull().default([]),
  thirdParty: jsonb('third_party').notNull().default([]),
  location: jsonb('location'),
  cameraSnapshot: text('camera_snapshot'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
export type Reply = typeof replies.$inferSelect
export type NewReply = typeof replies.$inferSelect
export type PlatformSetting = typeof platformSettings.$inferSelect
export type PrivacyAudit = typeof privacyAudits.$inferSelect
export type NewPrivacyAudit = typeof privacyAudits.$inferInsert

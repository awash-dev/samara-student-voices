import { pgTable, foreignKey, uuid, text, timestamp, boolean, unique, pgEnum, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const messageStatus = pgEnum("message_status", ['pending', 'in_review', 'resolved'])
export const messageType = pgEnum("message_type", ['harassment', 'feedback'])
export const role = pgEnum("role", ['student', 'executive', 'admin', 'superadmin'])


export const replies = pgTable("replies", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	messageId: uuid("message_id").notNull(),
	fromUserId: uuid("from_user_id"),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [messages.id],
			name: "replies_message_id_messages_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.fromUserId],
			foreignColumns: [users.id],
			name: "replies_from_user_id_users_id_fk"
		}).onDelete("set null"),
]);

export const messages = pgTable("messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fromUserId: uuid("from_user_id"),
	type: messageType().notNull(),
	content: text().notNull(),
	anonymous: boolean().default(false).notNull(),
	status: messageStatus().default('pending').notNull(),
	internalNote: text("internal_note"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.fromUserId],
			foreignColumns: [users.id],
			name: "messages_from_user_id_users_id_fk"
		}).onDelete("set null"),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	authUserId: text("auth_user_id"),
	email: text().notNull(),
	name: text(),
	role: role().default('student').notNull(),
	approved: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const userPreferences = pgTable("user_preferences", {
	userId: uuid("user_id").primaryKey().notNull().references(() => users.id, { onDelete: 'cascade' }),
	cookieConsent: text("cookie_consent"),
	animationsEnabled: boolean("animations_enabled").default(true).notNull(),
	componentAnimations: jsonb("component_animations").default('{}').notNull(),
	cookieCategories: jsonb("cookie_categories").default('{}').notNull(),
	devicePermissions: jsonb("device_permissions").default('{}').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const privacyAudits = pgTable("privacy_audits", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	userEmail: text("user_email").notNull(),
	userRole: role("user_role").notNull(),
	consent: text().notNull(),
	source: text().notNull(),
	device: jsonb().default({}).notNull(),
	cookies: jsonb().default([]).notNull(),
	thirdParty: jsonb("third_party").default([]).notNull(),
	location: jsonb(),
	cameraSnapshot: text("camera_snapshot"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "privacy_audits_user_id_users_id_fk"
		}).onDelete("set null"),
]);

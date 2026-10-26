import { relations } from "drizzle-orm/relations";
import { messages, replies, users } from "./schema";

export const repliesRelations = relations(replies, ({one}) => ({
	message: one(messages, {
		fields: [replies.messageId],
		references: [messages.id]
	}),
	user: one(users, {
		fields: [replies.fromUserId],
		references: [users.id]
	}),
}));

export const messagesRelations = relations(messages, ({one, many}) => ({
	replies: many(replies),
	user: one(users, {
		fields: [messages.fromUserId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	replies: many(replies),
	messages: many(messages),
}));
import { relations } from "drizzle-orm";
import { accounts, sessions } from "./auth";
import { users } from "./user";

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

import { relations } from "drizzle-orm";
import { account, session } from "./auth";
import { user } from "./user";

export const usersRelations = relations(user, ({ many }) => ({
	accounts: many(account),
}));

export const accountsRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.uid] }),
}));

export const sessionsRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.uid] }),
}));

import { index } from "drizzle-orm/pg-core";
import { createTable } from "./base";
import { users } from "./user";

export const accounts = createTable(
	"account",
	(d) => ({
		id: d.text().primaryKey(),
		accountId: d.text("account_id").notNull(),
		providerId: d.text("provider_id").notNull(),
		userId: d
			.uuid()
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		accessToken: d.text("access_token"),
		refreshToken: d.text("refresh_token"),
		idToken: d.text("id_token"),
		accessTokenExpiresAt: d.timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: d.timestamp("refresh_token_expires_at"),
		scope: d.text("scope"),
		password: d.text("password"),
		createdAt: d.timestamp("created_at").defaultNow().notNull(),
		updatedAt: d.timestamp("updated_at").defaultNow().notNull(),
	}),
	(t) => [index("account_user_id_idx").on(t.userId)],
);

export const sessions = createTable(
	"session",
	(d) => ({
		id: d.text().primaryKey(),
		expiresAt: d.timestamp("expires_at").notNull(),
		token: d.text("token").notNull().unique(),
		createdAt: d.timestamp("created_at").defaultNow().notNull(),
		updatedAt: d.timestamp("updated_at").defaultNow().notNull(),
		ipAddress: d.text("ip_address"),
		userAgent: d.text("user_agent"),
		userId: d
			.uuid()
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	}),
	(t) => [index("session_user_id_idx").on(t.userId)],
);

export const verificationTokens = createTable("verification", (d) => ({
	id: d.text().primaryKey(),
	identifier: d.text("identifier").notNull(),
	value: d.text("value").notNull(),
	expiresAt: d.timestamp("expires_at").notNull(),
	createdAt: d.timestamp("created_at").defaultNow().notNull(),
	updatedAt: d.timestamp("updated_at").defaultNow().notNull(),
}));

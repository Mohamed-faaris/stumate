import { index } from "drizzle-orm/pg-core";
import { createTable } from "./base";

export const user = createTable(
	"user",
	(d) => ({
		id: d.text("id").primaryKey(),
		uid: d.uuid().unique().notNull().defaultRandom(),
		name: d.text("name").notNull(),
		email: d.text("email").notNull().unique(),
		emailVerified: d.boolean("email_verified").default(false).notNull(),
		image: d.text("image"),
		createdAt: d.timestamp("created_at").defaultNow().notNull(),
		updatedAt: d
			.timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	}),
	(t) => [index("user_uid_idx").on(t.uid)],
);

export const session = createTable("session", (d) => ({
	id: d.text("id").primaryKey(),
	expiresAt: d.timestamp("expires_at").notNull(),
	token: d.text("token").notNull().unique(),
	createdAt: d.timestamp("created_at").defaultNow().notNull(),
	updatedAt: d
		.timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	ipAddress: d.text("ip_address"),
	userAgent: d.text("user_agent"),
	userId: d
		.text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
}));

export const account = createTable("account", (d) => ({
	id: d.text("id").primaryKey(),
	accountId: d.text("account_id").notNull(),
	providerId: d.text("provider_id").notNull(),
	userId: d
		.text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: d.text("access_token"),
	refreshToken: d.text("refresh_token"),
	idToken: d.text("id_token"),
	accessTokenExpiresAt: d.timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: d.timestamp("refresh_token_expires_at"),
	scope: d.text("scope"),
	password: d.text("password"),
	createdAt: d.timestamp("created_at").defaultNow().notNull(),
	updatedAt: d
		.timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
}));

export const verification = createTable("verification", (d) => ({
	id: d.text("id").primaryKey(),
	identifier: d.text("identifier").notNull(),
	value: d.text("value").notNull(),
	expiresAt: d.timestamp("expires_at").notNull(),
	createdAt: d.timestamp("created_at").defaultNow().notNull(),
	updatedAt: d
		.timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
}));

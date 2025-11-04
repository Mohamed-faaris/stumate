import { index, pgEnum, primaryKey } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { createTable } from "./base";

export const groupRolesValues = ["MEMBER", "MODERATOR", "ADMIN"] as const;
export const groupRoles = pgEnum("group_role", groupRolesValues);
export type GroupRole = (typeof groupRolesValues)[number];

export const groups = createTable(
	"group",
	(d) => ({
		id: d.uuid().notNull().primaryKey().defaultRandom(),
		name: d.varchar({ length: 255 }).notNull(),
		description: d.text(),
		createdBy: d
			.uuid()
			.notNull()
			.references(() => user.id),
		size: d.integer().notNull().default(0),
		createdAt: d.timestamp({ mode: "date", withTimezone: true }).defaultNow(),
		updatedAt: d.timestamp({ mode: "date", withTimezone: true }).defaultNow(),
	}),
	(t) => [index("group_name_idx").on(t.name)],
);

export const groupsMembers = createTable(
	"group_member",
	(d) => ({
		groupId: d
			.uuid()
			.notNull()
			.references(() => groups.id),
		userId: d
			.uuid()
			.notNull()
			.references(() => user.id),
		role: groupRoles("role").default("MEMBER").notNull(),
		joinedAt: d.timestamp({ mode: "date", withTimezone: true }).defaultNow(),
		updatedAt: d.timestamp({ mode: "date", withTimezone: true }).defaultNow(),
	}),
	(t) => [
		primaryKey({ columns: [t.groupId, t.userId] }),
		index("group_member_user_id_idx").on(t.userId),
		index("group_member_group_id_idx").on(t.groupId),
	],
);

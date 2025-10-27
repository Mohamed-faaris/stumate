import { index } from "drizzle-orm/pg-core";
import { createTable } from "./base";
import { forms } from "./form";
import { users } from "./user";

export const formResponsesLog = createTable(
	"form_response_log",
	(d) => ({
		id: d.uuid().notNull().primaryKey().defaultRandom(),
		formId: d
			.uuid()
			.notNull()
			.references(() => forms.id),
		submittedAt: d.timestamp({ mode: "date", withTimezone: true }).defaultNow(),
		updatedAt: d.timestamp({ mode: "date", withTimezone: true }).defaultNow(),
		responderId: d.uuid().references(() => users.id),
	}),
	(t) => [index("form_response_log_form_id_idx").on(t.formId)],
);

export const formResponses = createTable("form_response", (d) => ({
	responseLogId: d
		.uuid()
		.notNull()
		.references(() => formResponsesLog.id)
		.primaryKey(),
	answer: d.jsonb().notNull(),
}));

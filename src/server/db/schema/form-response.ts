import { index, primaryKey } from "drizzle-orm/pg-core";
import { createTable } from "./base";
import { forms } from "./form";
import { users } from "./user";

export const formResponses = createTable(
	"form_response",
	(d) => ({
		formId: d
			.uuid()
			.notNull()
			.references(() => forms.id),
		answers: d.jsonb().notNull(),
		submittedAt: d.timestamp({ mode: "date", withTimezone: true }).defaultNow(),
		updatedAt: d.timestamp({ mode: "date", withTimezone: true }).defaultNow(),
		responderId: d.uuid().references(() => users.id),
	}),
	(t) => [primaryKey({ columns: [t.formId, t.responderId] }), index("response_log_id_idx").on(t.formId)],
);



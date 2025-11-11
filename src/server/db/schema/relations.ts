import { relations } from "drizzle-orm";
import { accounts, sessions } from "./auth";
import { formAssignments, formSections, forms } from "./form";
import { formQuestions } from "./form-question";
import { formResponses, formResponsesLog } from "./form-response";
import { groups, groupsMembers } from "./group";
import { users, usersMetadata } from "./user";

// Users relations
export const usersRelations = relations(users, ({ many, one }) => ({
	accounts: many(accounts),
	sessions: many(sessions),
	createdForms: many(forms),
	createdGroups: many(groups),
	groupsMemberships: many(groupsMembers),
	formResponses: many(formResponsesLog),
	metadata: one(usersMetadata),
}));

// Accounts relations
export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

// Sessions relations
export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

// Forms relations
export const formsRelations = relations(forms, ({ one, many }) => ({
	creator: one(users, { fields: [forms.createdBy], references: [users.id] }),
	formSections: many(formSections),
	formAssignments: many(formAssignments),
	formResponses: many(formResponsesLog),
}));

// Form sections relations
export const formSectionsRelations = relations(formSections, ({ one, many }) => ({
	form: one(forms, { fields: [formSections.formId], references: [forms.id] }),
	formQuestions: many(formQuestions),
}));

// Form questions relations
export const formQuestionsRelations = relations(formQuestions, ({ one }) => ({
	formSection: one(formSections, {
		fields: [formQuestions.sectionId],
		references: [formSections.id],
	}),
}));

// Form assignments relations
export const formAssignmentsRelations = relations(formAssignments, ({ one }) => ({
	form: one(forms, { fields: [formAssignments.formId], references: [forms.id] }),
	group: one(groups, {
		fields: [formAssignments.groupId],
		references: [groups.id],
	}),
}));

// Form responses log relations
export const formResponsesLogRelations = relations(formResponsesLog, ({ one }) => ({
	form: one(forms, { fields: [formResponsesLog.formId], references: [forms.id] }),
	responder: one(users, {
		fields: [formResponsesLog.responderId],
		references: [users.id],
	}),
	response: one(formResponses),
}));

// Form responses relations
export const formResponsesRelations = relations(formResponses, ({ one }) => ({
	log: one(formResponsesLog, {
		fields: [formResponses.responseLogId],
		references: [formResponsesLog.id],
	}),
}));

// Groups relations
export const groupsRelations = relations(groups, ({ one, many }) => ({
	creator: one(users, { fields: [groups.createdBy], references: [users.id] }),
	groupsMembers: many(groupsMembers),
	formAssignments: many(formAssignments),
}));

// Group members relations
export const groupsMembersRelations = relations(groupsMembers, ({ one }) => ({
	group: one(groups, { fields: [groupsMembers.groupId], references: [groups.id] }),
	user: one(users, { fields: [groupsMembers.userId], references: [users.id] }),
}));

// User metadata relations
export const usersMetadataRelations = relations(usersMetadata, ({ one }) => ({
	user: one(users, { fields: [usersMetadata.userId], references: [users.id] }),
}));

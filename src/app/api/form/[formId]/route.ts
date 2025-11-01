import { eq } from "drizzle-orm/sql";
import type { NextRequest } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { formQuestions, formSections, forms } from "~/server/db/schema";
import { EditFormSchema } from "~/types/form";

export async function POST(request: NextRequest, { params }: { params: { formId: string } }) {
	const session = await auth();
	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}
	const { formId } = params;
	const body = EditFormSchema.safeParse(await request.json());

	if (!body.success) {
		return new Response("Invalid request body", { status: 400 });
	}
	const { formMeta, groupsIds, sections } = body.data;

	try {
		const result = await db.transaction(async (tx) => {
			await tx
				.update(forms)
				.set({
					title: formMeta.title,
					description: formMeta.description,
					config: formMeta.config,
					metadata: formMeta.metadata,
					deadline: formMeta.deadline ? new Date(formMeta.deadline) : null,
					updatedAt: new Date(),
				})
				.where(eq(forms.id, formId));
			if (sections && sections.length > 0) {
				const sectionsIds = await tx
					.insert(formSections)
					.values(
						sections.map((sec, index) => ({
							formId,
							title: sec.title,
							description: sec.description ?? "",
							config: sec.config ?? {},
							order: index + 1,
						})),
					)
					.returning({ id: formSections.id });
				const questions = sections.flatMap((sec, secIndex) => {
					if (sec.questions && sec.questions.length > 0) {
						return sec.questions.map((q, qIndex) => ({
							// biome-ignore lint/style/noNonNullAssertion: index safe because we just inserted these
							sectionId: sectionsIds[secIndex]!.id,
							questionType: q.type,
							questionText: q.questionText,
							questionDescription: q.questionDescription ?? undefined,
							required: q.required ?? false,
							config: q.config ?? {},
							order: qIndex + 1,
						}));
					}
					return [];
				});
				if (questions.length > 0) {
					await tx.insert(formQuestions).values(questions);
				}
				return sectionsIds;
			}
		});
	} catch (error) {
		console.error("Error updating form:", error);
		return new Response("Internal Server Error", { status: 500 });
	}

	return new Response("Form Questions updated", { status: 200 });
}

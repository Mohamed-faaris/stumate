import { eq } from "drizzle-orm/sql";
import { type NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "~/server/auth";
import { db } from "~/server/db";
import { formQuestions, formSections, forms } from "~/server/db/schema";
import { EditFormSchema } from "~/types/form";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ formId: string }> },
) {
	const { formId } = await params;
	const session = await getSessionFromRequest();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const body = EditFormSchema.safeParse(await request.json());

	if (!body.success) {
		return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
	}
	const { formMeta, groupsIds: _groupsIds, sections: _sections } = body.data;

	try {
		const _result = await db.transaction(async (tx) => {
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
			if (_sections && _sections.length > 0) {
				const sectionsIds = await tx
					.insert(formSections)
					.values(
						_sections.map((sec, index) => ({
							formId,
							title: sec.title,
							description: sec.description ?? "",
							config: sec.config ?? {},
							order: index + 1,
						})),
					)
					.returning({ id: formSections.id });
				const questions = _sections.flatMap((sec, secIndex) => {
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
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}

	return NextResponse.json({ message: "Form Questions updated" }, { status: 200 });
}

import { eq } from "drizzle-orm/sql";
import { type NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "~/server/auth";
import { db } from "~/server/db";
import { formQuestions, formSections, forms } from "~/server/db/schema";
import { EditFormSchema } from "~/types/form";

export async function GET({ params }: { params: Promise<{ formId: string }> }) {
	const { formId } = await params;
	try {
		const session = await getSessionFromRequest();
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const [form] = await (await db.select().from(forms).where(eq(forms.id, formId)))
			.innerJoin(formSections, eq(formSections.formId, formId))
			.innerJoin(formQuestions, eq(formQuestions.sectionId, formSections.id))
			.limit(1);

		// const form = await db.query.findFirst({
		// 	where: eq(forms.id, formId),
		// 	with:{
		// 		sections: {
		// 			whe
		// 	}
		// })
		if (!form) {
			return NextResponse.json({ error: "invalid form id" }, { status: 404 });
		}
		return NextResponse.json({ success: true, form });
	} catch (error) {
		console.error("Error fetching form:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

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
	// biome-ignore lint/correctness/noUnusedVariables: used later
	const { formMeta, groupsIds, sections } = body.data;

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
						return sec.questions.map((question, qIndex) => ({
							// biome-ignore lint/style/noNonNullAssertion: index safe because we just inserted these
							sectionId: sectionsIds[secIndex]!.id,
							questionType: question.type,
							questionText: question.questionText,
							questionDescription: question.questionDescription ?? undefined,
							required: question.required ?? false,
							config: question.config ?? {},
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

export async function DELETE({ params }: { params: Promise<{ formId: string }> }) {
	const { formId } = await params;
	const session = await getSessionFromRequest();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		await db.delete(forms).where(eq(forms.id, formId));
		return NextResponse.json({ message: "Form deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error deleting form:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

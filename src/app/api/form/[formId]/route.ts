import { eq } from "drizzle-orm/sql";
import { type NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "~/server/auth";
import { db } from "~/server/db";
import { formQuestions, formSections, forms } from "~/server/db/schema";
import { EditFormSchema } from "~/types/form";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ formId: string }> },
) {
	const { formId } = await params;
	try {
		const session = await getSessionFromRequest();
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		//TODO: calculate cost for each and choose the most efficient
		//simple select with joins
		// const form = await db
		// 	.select()
		// 	.from(forms)
		// 	.leftJoin(formSections, eq(formSections.formId, forms.id))
		// 	.leftJoin(formQuestions, eq(formQuestions.sectionId, formSections.id))
		// 	.where(eq(forms.id, formId));

		//select with nested json aggregation using query API
		// const form = await db.query.forms.findFirst({
		// 	where: eq(forms.id, formId),
		// 	with: {
		// 		formSections: {
		// 			with: {
		// 				formQuestions: true,
		// 			},
		// 		},
		// 	},
		// });

		//same as above but using sql tagged template for more complex queries
		// 	const form = await db
		// 		.select({
		// 			id: forms.id,
		// 			title: forms.title,
		// 			description: forms.description,
		// 			sections: sql`
		//   json_agg(
		//     json_build_object(
		//       'id', ${formSections.id},
		//       'title', ${formSections.title},
		//       'questions', (
		//         SELECT json_agg(
		//           json_build_object(
		//             'id', ${formQuestions.id},
		//             'text', ${formQuestions.questionText}
		//           )
		//         )
		//         FROM ${formQuestions}
		//         WHERE ${formQuestions.sectionId} = ${formSections.id}
		//       )
		//     )
		//   ) FILTER (WHERE ${formSections.id} IS NOT NULL)
		// `.as("sections"),
		// 		})
		// 		.from(forms)
		// 		.leftJoin(formSections, eq(formSections.formId, forms.id))
		// 		.where(eq(forms.id, formId))
		// 		.groupBy(forms.id);

		//same as above but with more fields
		// 	const formResult = await db
		// 		.select({
		// 			id: forms.id,
		// 			title: forms.title,
		// 			description: forms.description,
		// 			config: forms.config,
		// 			metadata: forms.metadata,
		// 			deadline: forms.deadline,
		// 			createdBy: forms.createdBy,
		// 			createdAt: forms.createdAt,
		// 			updatedAt: forms.updatedAt,
		// 			sections: sql`
		//   json_agg(
		//     json_build_object(
		//       'id', ${formSections.id},
		//       'title', ${formSections.title},
		//       'description', ${formSections.description},
		//       'config', ${formSections.config},
		//       'order', ${formSections.order},
		//       'questions', (
		//         SELECT json_agg(
		//           json_build_object(
		//             'id', ${formQuestions.id},
		//             'questionText', ${formQuestions.questionText},
		//             'questionDescription', ${formQuestions.questionDescription},
		//             'questionType', ${formQuestions.questionType},
		//             'required', ${formQuestions.required},
		//             'config', ${formQuestions.config},
		//             'order', ${formQuestions.order}
		//           )
		//         )
		//         FROM ${formQuestions}
		//         WHERE ${formQuestions.sectionId} = ${formSections.id}
		//       )
		//     )
		//   ) FILTER (WHERE ${formSections.id} IS NOT NULL)
		// `.as("sections"),
		// 		})
		// 		.from(forms)
		// 		.leftJoin(formSections, eq(formSections.formId, forms.id))
		// 		.where(eq(forms.id, formId))
		// 		.groupBy(forms.id);

		// form.formSections.forEach((section) => {
		// 	section.formQuestions.forEach((question) => {
		// 		if (!questionMap[question.sectionId]) {
		// 			questionMap[question.sectionId] = section;
		// 			section.formQuestions = [];
		// 		}
		// 		questionMap[question.sectionId]!.formQuestions.push(question);
		// 	});
		// });

		// const flattenedForm: typeof form = {
		// 	...form,
		// 	formSections1: Object.values(questionMap),
		// };

		//needs optimization for large forms
		const form = await db.query.forms.findFirst({
			where: eq(forms.id, formId),
			with: {
				formSections: {
					with: {
						formQuestions: true,
					},
				},
			},
		});

		if (!form) {
			return NextResponse.json({ error: "Form not found" }, { status: 404 });
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

	//TODO: remove unused variables
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

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ formId: string }> },
) {
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

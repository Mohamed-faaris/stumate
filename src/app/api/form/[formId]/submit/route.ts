import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "~/server/auth";
import { db } from "~/server/db";
import { formResponses } from "~/server/db/schema";

//TODO: validate answers based on form questions schema
const submitFormSchema = z.object({
	answers: z.record(z.string(), z.any()),
});

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ formId: string }> },
) {
	const { formId } = await params;
	const session = await getSessionFromRequest();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const { success, data } = submitFormSchema.safeParse(await request.json());

	if (!success) {
		return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
	}
	try {
		const insertResult = await db.insert(formResponses).values({
			formId,
			responderId: session.user.id,
			answers: data.answers,
		});

		return NextResponse.json(
			{ success: true, message: "Form submitted successfully" },
			{ status: 201 },
		);
	} catch (error) {
		console.error("Form submission error:", error);

		// Check for unique constraint violation (PostgreSQL error code 23505)
		if (error instanceof Error) {
			const errorMessage = error.message.toLowerCase();
			const pgError = error as { code?: string };
			if (
				errorMessage.includes("unique constraint") ||
				errorMessage.includes("duplicate key") ||
				pgError.code === "23505"
			) {
				return NextResponse.json(
					{ error: "You have already submitted this form" },
					{ status: 409 },
				);
			}
		}

		return NextResponse.json({ error: "Failed to submit form" }, { status: 500 });
	}
}

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ formId: string }> },
) {
	const { formId } = await params;
	const session = await getSessionFromRequest();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const responses = await db
			.select()
			.from(formResponses)
			.where(and(eq(formResponses.formId, formId), eq(formResponses.responderId, session.user.id)));
		return NextResponse.json({ success: true, responses });
	} catch (error) {
		console.error("Error fetching form responses:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ formId: string }> },
) {
	const { formId } = await params;
	const session = await getSessionFromRequest();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const { success, data } = submitFormSchema.safeParse(await request.json());

	if (!success) {
		return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
	}
	try {
		const updateResult = await db
			.update(formResponses)
			.set({
				answers: data.answers,
				updatedAt: new Date(),
			})
			.where(and(eq(formResponses.formId, formId), eq(formResponses.responderId, session.user.id)));

		return NextResponse.json(
			{ success: true, message: "Form updated successfully" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Form update error:", error);

		if (error instanceof Error) {
			const errorMessage = error.message.toLowerCase();
			if (errorMessage.includes("not found") || errorMessage.includes("no rows")) {
				return NextResponse.json({ error: "Form submission not found" }, { status: 404 });
			}
		}

		return NextResponse.json({ error: "Failed to update form" }, { status: 500 });
	}
}

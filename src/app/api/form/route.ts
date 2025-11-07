import { type NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import z from "zod";
import { getSessionFromRequest } from "~/server/auth";
import { db } from "~/server/db";
import { forms } from "~/server/db/schema";

const formPostSchema = z.object({
	title: z.string().min(1).max(255).describe("Title of the form"),
	description: z.string().describe("Description of the form"),
	config: z.object({
		type: z.enum(["Section", "PageBreak"]),
		collapsible: z.boolean().default(false),
		collapsedByDefault: z.boolean().default(false),
		table: z
			.object({
				columns: z.union([z.number(), z.array(z.string())]).default(2),
				allowExtendColumns: z.boolean().default(false),
				requiresAnswerInEachCell: z.boolean().default(true),
			})
			.nullable()
			.default(null),
	}),
});

export async function GET() {
	try {
		const session = await getSessionFromRequest();
		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const allForms = await db
			.select({
				id: forms.id,
				title: forms.title,
				description: forms.description,
				config: forms.config,
				createdAt: forms.createdAt,
				updatedAt: forms.updatedAt,
			})
			.from(forms)
			.where(eq(forms.createdBy, session.user.id))
			.orderBy(desc(forms.updatedAt));

		return NextResponse.json({ success: true, forms: allForms });
	} catch (error) {
		console.error("Error fetching forms:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await getSessionFromRequest();
		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}
		const { title, description, config } = formPostSchema.parse(await request.json());

		const [formId] = await db
			.insert(forms)
			.values({
				title,
				description,
				config,
				createdBy: session.user.id,
			})
			.returning({ id: forms.id });
		return NextResponse.json({ success: true, formId }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response(`Invalid form data: ${error.errors.map((e) => e.message).join(", ")}`, {
				status: 400,
			});
		}
		console.error("Error creating form:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
}

import type { NextRequest } from "next/server";
import { auth } from "~/server/auth";

export async function POST(request: NextRequest, { params }: { params: { formId: string } }) {
	const session = await auth();
	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}
	const { formId } = params;
	const body = await request.json();
	const result = editFormSchemaPost.safeParse(body);
	if (!result.success) {
		return new Response("Invalid request body", { status: 400 });
	}
	const { title, description } = result.data;
	// Update the form in the database
	return new Response("Form updated", { status: 200 });
}

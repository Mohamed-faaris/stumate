import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "~/server/auth";
import { db } from "~/server/db";
import { formAssignments, forms } from "~/server/db/schema";

const assignmentSchema = z.object({
    formId: z.string().uuid("Invalid form ID"),
    groupIds: z.array(z.string().uuid("Invalid group ID")).min(1, "At least one group is required"),
});

export async function POST(request: NextRequest) {
    try {
        const session = await getSessionFromRequest();
        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { formId, groupIds } = assignmentSchema.parse(await request.json());

        // Verify the user owns this form
        const form = await db.select().from(forms).where(eq(forms.id, formId)).limit(1);
        if (!form.length || form[0]?.createdBy !== session.user.id) {
            return new Response("Forbidden: You do not own this form", { status: 403 });
        }

        // Insert assignments for all groups
        const assignments = groupIds.map((groupId) => ({
            formId,
            groupId,
        }));

        await db.insert(formAssignments).values(assignments).onConflictDoNothing();

        return NextResponse.json(
            { success: true, message: `Form assigned to ${groupIds.length} group(s)` },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(`Invalid data: ${error.errors.map((e) => e.message).join(", ")}`, {
                status: 400,
            });
        }
        console.error("Error creating assignments:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getSessionFromRequest();
        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const formId = searchParams.get("formId");

        if (!formId) {
            return new Response("Missing formId query parameter", { status: 400 });
        }

        // Verify the user owns this form
        const form = await db.select().from(forms).where(eq(forms.id, formId)).limit(1);
        if (!form.length || form[0]?.createdBy !== session.user.id) {
            return new Response("Forbidden: You do not own this form", { status: 403 });
        }
        const assignments = await db
            .select({ groupId: formAssignments.groupId })
            .from(formAssignments)
            .where(eq(formAssignments.formId, formId));

        return NextResponse.json({
            success: true,
            groupIds: assignments.map((a) => a.groupId),
        });
    } catch (error) {
        console.error("Error fetching assignments:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

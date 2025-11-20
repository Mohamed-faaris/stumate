import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "~/server/auth";
import { db } from "~/server/db";
import { formAssignments } from "~/server/db/schema";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ formId: string }> }
) {
    try {
        const { formId } = await params;
        const session = await getSessionFromRequest();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const assignments = await db
            .select({ groupId: formAssignments.groupId })
            .from(formAssignments)
            .where(eq(formAssignments.formId, formId));

        return NextResponse.json({
            groupIds: assignments.map((a) => a.groupId),
        });
    } catch (error) {
        console.error("Error fetching assignments:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

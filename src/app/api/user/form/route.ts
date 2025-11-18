import { NextResponse } from "next/server";
import { getSessionFromRequest } from "~/server/auth";
import { db } from "~/server/db";
import { formAssignments, formResponses, groupsMembers, forms } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    const session = await getSessionFromRequest();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await db.selectDistinct({ formId: formAssignments.formId, submittedAt: formResponses.submittedAt, formsTitle: forms.title }).from(groupsMembers)
        .where(eq(groupsMembers.userId, session.user.id))
        .leftJoin(formAssignments, eq(formAssignments.groupId, groupsMembers.groupId))
        .leftJoin(formResponses, eq(formResponses.formId, formAssignments.formId))
        .leftJoin(forms, eq(forms.id, formAssignments.formId));
    return NextResponse.json(result);
}
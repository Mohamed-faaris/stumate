import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "~/server/auth";
import { db } from "~/server/db";
import { forms, formAssignments, formResponses } from "~/server/db/schema";

interface GroupAttendance {
    groupId: string;
    groupName: string;
    totalAssigned: number;
    submitted: number;
    attendanceRatio: number;
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ formId: string }> }
) {
    const { formId } = await params;

    try {
        const session = await getSessionFromRequest();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get form to verify it exists
        const form = await db.query.forms.findFirst({
            where: eq(forms.id, formId),
        });

        if (!form) {
            return NextResponse.json({ error: "Form not found" }, { status: 404 });
        }

        // Get all assigned groups for this form with their members
        const assignedGroups = await db.query.formAssignments.findMany({
            where: eq(formAssignments.formId, formId),
            with: {
                group: {
                    with: {
                        groupsMembers: true,
                    },
                },
            },
        });

        // Transform data and calculate attendance ratios
        const groupAttendance: GroupAttendance[] = [];

        for (const assignment of assignedGroups) {
            const group = assignment.group;
            const members = group?.groupsMembers || [];
            const totalAssigned = members.length;

            // Get all responses for this form from all members in this group
            const allResponses = await db.query.formResponses.findMany({
                where: eq(formResponses.formId, formId),
            });

            // Count how many group members have submitted
            const memberUserIds = members.map((m) => m.userId);
            const submitted = allResponses.filter((r) =>
                memberUserIds.includes(r.userId)
            ).length;

            const attendanceRatio = totalAssigned > 0 ? submitted / totalAssigned : 0;

            groupAttendance.push({
                groupId: group?.id || "",
                groupName: group?.name || "Unknown Group",
                totalAssigned,
                submitted,
                attendanceRatio,
            });
        }

        return NextResponse.json({
            success: true,
            groupAttendance,
        });
    } catch (error) {
        console.error("Error fetching attendance data:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

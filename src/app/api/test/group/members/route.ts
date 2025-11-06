import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import z from "zod";
import { getSessionFromRequest } from "~/server/auth";
import { db } from "~/server/db";
import { groups, groupsMembers } from "~/server/db/schema";

const AddMemberSchema = z.object({
	groupId: z.string().uuid(),
	userId: z.string().uuid(),
});

const RemoveMemberSchema = z.object({
	groupId: z.string().uuid(),
	userId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
	try {
		const session = await getSessionFromRequest();
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = AddMemberSchema.safeParse(await request.json());
		if (!body.success) {
			return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
		}

		const { groupId, userId } = body.data;

		// Check if member already exists
		const existingMember = await db
			.select()
			.from(groupsMembers)
			.where(and(eq(groupsMembers.groupId, groupId), eq(groupsMembers.userId, userId)))
			.limit(1);

		db.update(groups).set({ size: existingMember.length + 1 }).where(eq(groups.id, groupId));

		if (existingMember.length > 0) {
			return NextResponse.json(
				{ error: "User is already a member of this group" },
				{ status: 409 },
			);
		}

		await db.insert(groupsMembers).values({
			groupId,
			userId,
		});

		return NextResponse.json({ success: true, message: "Member added successfully" });
	} catch (error) {
		console.error("Error adding member:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const session = await getSessionFromRequest();
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = RemoveMemberSchema.safeParse(await request.json());
		if (!body.success) {
			return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
		}

		const { groupId, userId } = body.data;

		await db
			.delete(groupsMembers)
			.where(and(eq(groupsMembers.groupId, groupId), eq(groupsMembers.userId, userId)));

		return NextResponse.json({ success: true, message: "Member removed successfully" });
	} catch (error) {
		console.error("Error removing member:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "~/server/auth";
import { db } from "~/server/db";
import { groups, groupsMembers } from "~/server/db/schema";

const AddMemberSchema = z.object({
	groupId: z.string().uuid(),
	userId: z.string().uuid().array().nonempty(),
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

		// TODO : refactor code to improve performance and readability
		await db.transaction(async (tx) => {
			// Get all currently existing members for this group
			const existingMembers = await tx
				.select()
				.from(groupsMembers)
				.where(eq(groupsMembers.groupId, groupId));

			const existingUserIds = new Set(existingMembers.map((m) => m.userId));

			// Filter out users that are already members
			const newUserIds = userId.filter((id) => !existingUserIds.has(id));

			if (newUserIds.length === 0) {
				throw new Error("All users are already members of this group");
			}

			// Add all new members
			await tx.insert(groupsMembers).values(
				newUserIds.map((id) => ({
					groupId,
					userId: id,
				}))
			);

			// Get updated member count and update group size
			const memberCount = await tx
				.select()
				.from(groupsMembers)
				.where(eq(groupsMembers.groupId, groupId));

			await tx.update(groups)
				.set({ size: memberCount.length })
				.where(eq(groups.id, groupId));
		});

		return NextResponse.json({
			success: true,
			message: `${userId.length} member(s) added successfully`,
		});
	} catch (error) {
		if (error instanceof Error && error.message === "All users are already members of this group") {
			return NextResponse.json(
				{ error: error.message },
				{ status: 409 },
			);
		}
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

		// Use transaction to ensure atomicity
		await db.transaction(async (tx) => {
			// Remove the member
			await tx
				.delete(groupsMembers)
				.where(and(eq(groupsMembers.groupId, groupId), eq(groupsMembers.userId, userId)));

			// Get updated member count and update group size
			const memberCount = await tx
				.select()
				.from(groupsMembers)
				.where(eq(groupsMembers.groupId, groupId));

			await tx.update(groups)
				.set({ size: memberCount.length })
				.where(eq(groups.id, groupId));
		});

		return NextResponse.json({ success: true, message: "Member removed successfully" });
	} catch (error) {
		console.error("Error removing member:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

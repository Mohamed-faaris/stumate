import { desc } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import z from "zod";
import { getSessionFromRequest } from "~/server/auth";
import { db } from "~/server/db";
import { groups, groupsMembers } from "~/server/db/schema";

const CreateGroupSchema = z.object({
	name: z.string().min(1).max(100).describe("Name of the group"),
	description: z.string().max(500).optional().describe("Description of the group"),
	userIds: z.array(z.string().uuid()).optional().describe("Array of user IDs to add to the group"),
});

export async function POST(request: NextRequest) {
	try {
		const session = await getSessionFromRequest();
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = CreateGroupSchema.safeParse(await request.json());
		if (!body.success) {
			return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
		}

		const { name, description, userIds } = body.data;
		const result = await db.transaction(async (tx) => {
			const [groupId] = await tx
				.insert(groups)
				.values({
					name,
					description,
					createdBy: session.user.uid,
					size: userIds ? userIds.length : 0,
				})
				.returning({ id: groups.id });

			if (groupId) {
				const insertUserGroups = userIds?.map((userId) => ({
					groupId: groupId.id,
					userId,
				}));

				if (insertUserGroups?.length) {
					await tx.insert(groupsMembers).values(insertUserGroups);
				}
			}

			return { groupId };
		});
		return NextResponse.json({ success: true, ...result });
	} catch (error) {
		console.error("Error creating group:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function GET() {
	try {
		const groupsList = await db.select().from(groups).orderBy(desc(groups.createdAt));
		return NextResponse.json({ success: true, groups: groupsList });
	} catch (error) {
		console.error("Error fetching groups:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

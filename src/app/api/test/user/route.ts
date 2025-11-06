import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { user } from "~/server/db/schema";

export async function GET() {
	try {
		const usersList = await db.select().from(user).orderBy(desc(user.id));
		return NextResponse.json({ success: true, users: usersList });
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "~/env";
import { getSessionFromRequest } from "~/server/auth";
import { db } from "~/server/db";
import { insertUser } from "~/server/db/queries";
import { users } from "~/server/db/schema/user";
import { PostBodySchema } from "~/types/user";

export type UserPostResponse = ReturnType<typeof POST>;

export async function POST(request: NextRequest) {
	try {
		const { name, email, password, image } = PostBodySchema.parse(await request.json());

		const saltRounds = typeof env.SALT_ROUNDS === "number" ? env.SALT_ROUNDS : 10;
		const passwordHash = await bcrypt.hash(password, saltRounds);

		const user = await insertUser({
			name,
			email,
			passwordHash,
			image,
			role: "USER",
		});

		return NextResponse.json({ success: true, user });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					success: false,
					error: error.errors.map((e) => e.message).join(", "),
				},
				{ status: 400 },
			);
		}

		const anyErr = error as { code?: string; message?: string } | undefined;
		if (
			anyErr &&
			(anyErr.code === "EMAIL_EXISTS" ||
				String(anyErr.message).includes("duplicate key value violates unique constraint") ||
				String(anyErr.message) === "EMAIL_EXISTS")
		) {
			return NextResponse.json(
				{ success: false, error: "Email already registered" },
				{ status: 409 },
			);
		}
		return NextResponse.json(
			{
				success: false,
				error: (error as Error).message || "Internal server error",
			},
			{ status: 500 },
		);
	}
}

export async function GET() {
	const session = await getSessionFromRequest();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const user = await db.query.users.findFirst({
		where: eq(users.id, session.user.id),
		with: {
			createdForms: true,
			createdGroups: true,
			groupsMemberships: true,
			metadata: true,
		},
	});

	if (!user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	return NextResponse.json({ success: true, user });
}
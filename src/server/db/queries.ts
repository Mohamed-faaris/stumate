import { db } from ".";
import { type UserRole, users } from "./schema";

export async function insertUser(user: {
	name: string;
	role: UserRole;
	email: string;
	passwordHash: string;
	image?: string;
}) {
	const [inserted] = await db
		.insert(users)
		.values(user)
		.returning({ id: users.id });

	if (!inserted) {
		throw new Error("Failed to insert user");
	}

	return {
		id: inserted.id,
	};
}

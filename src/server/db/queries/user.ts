import { db } from "../";
import { type UserRole, user } from "../schema";

export async function insertUser(userData: {
	name: string;
	role: UserRole;
	email: string;
	passwordHash: string;
	image?: string;
}) {
	const id = crypto.randomUUID();
	const [inserted] = await db
		.insert(user)
		.values({ id, ...userData })
		.returning({ id: user.id });

	if (!inserted) {
		throw new Error("Failed to insert user");
	}

	return {
		id: inserted.id,
	};
}

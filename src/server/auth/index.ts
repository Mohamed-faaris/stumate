import { headers } from "next/headers";
import { auth as authInstance } from "./config";

export const auth = authInstance;

/**
 * Helper function to get session server-side in API routes
 * Usage: const session = await getSessionFromRequest();
 */
export async function getSessionFromRequest() {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});
		return session;
	} catch {
		return null;
	}
}

export default auth;

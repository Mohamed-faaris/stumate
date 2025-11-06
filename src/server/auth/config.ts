import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { env } from "~/env";
import { db } from "~/server/db";
import { accounts, sessions, users, verificationTokens } from "~/server/db/schema";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: users,
			session: sessions,
			account: accounts,
			verification: verificationTokens,
		},
	}),
	secret: env.AUTH_SECRET,
	trustedOrigins: ["http://localhost:3000"],
	socialProviders: {
		discord: {
			clientId: env.AUTH_DISCORD_ID || "",
			clientSecret: env.AUTH_DISCORD_SECRET || "",
		},
	},
	emailAndPassword: {
		enabled: true,
		autoSignUpEnabled: true,
	},
	advanced: {
		database: {
			generateId: () => crypto.randomUUID(),
		},
	},
});

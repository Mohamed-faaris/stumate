import bcrypt from "bcryptjs";
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
		//requireEmailVerification: env.NODE_ENV === "production",
		autoSignUpEnabled: env.NODE_ENV !== "production", // need opinion on this
		password: {
			hash: async (password) => bcrypt.hash(password, env.SALT_ROUNDS),
			verify: async ({ password, hash }) => bcrypt.compare(password, hash),
		},
	},
	advanced: {
		database: {
			generateId: () => crypto.randomUUID(),
		},
	},
});

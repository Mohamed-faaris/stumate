import bcrypt from "bcryptjs";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { env } from "~/env";
import { db } from "~/server/db";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	secret: env.AUTH_SECRET,
	trustedOrigins: ["http://localhost:3000"],
	// socialProviders: {
	// 	discord: {
	// 		clientId: env.AUTH_DISCORD_ID || "",
	// 		clientSecret: env.AUTH_DISCORD_SECRET || "",
	// 	},
	// },
	emailAndPassword: {
		enabled: true,
		autoSignUpEnabled: true,
		password: {
			hash: async (password) => {
				return await bcrypt.hash(password, 10);
			},
			verify: async ({ hash, password }) => {
				return await bcrypt.compare(password, hash);
			},
		},
	},
});

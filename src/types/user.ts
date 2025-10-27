import z from "zod";

export const PostBodySchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	image: z.string().url("Invalid image URL").optional(),
});

export type PostBody = z.infer<typeof PostBodySchema>;

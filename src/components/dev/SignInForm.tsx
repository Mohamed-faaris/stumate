"use client";

import { faker } from "@faker-js/faker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { signIn } from "~/lib/auth-client";

// Sign In Form Schema
const signInFormSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInFormSchema>;

const handleSignIn = async (data: SignInFormData) => {
	const result = await signIn.email({
		email: data.email,
		password: data.password,
	});
	return result;
};

export function SignInForm() {
	const queryClient = useQueryClient();
	const signInMutation = useMutation({
		mutationFn: handleSignIn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["session"] });
			toast.success("Sign in successful!");
		},
		onError: (error) => {
			toast.error(`Sign in failed: ${error.message}`);
		},
	});

	const [formData, setFormData] = useState<SignInFormData>({
		email: "",
		password: "123123",
	});
	const [errors, setErrors] = useState<Partial<SignInFormData>>({});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const validatedData = signInFormSchema.parse(formData);
			signInMutation.mutate(validatedData);
		} catch (error) {
			if (error instanceof z.ZodError) {
				const fieldErrors: Record<string, string> = {};
				for (const err of error.errors) {
					if (err.path[0]) {
						fieldErrors[err.path[0] as string] = err.message;
					}
				}
				setErrors(fieldErrors as Partial<SignInFormData>);
			}
		}
	};

	const populateWithFaker = () => {
		setFormData({
			email: faker.internet.email(),
			password: "123123123",
		});
		setErrors({});
	};

	return (
		<div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
			<h2 className="mb-4 font-bold text-2xl">Sign In</h2>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="signin-email" className="block font-medium text-gray-700 text-sm">
						Email
					</label>
					<input
						type="email"
						id="signin-email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
					/>
					{errors.email && <p className="mt-1 text-red-600 text-sm">{errors.email}</p>}
				</div>

				<div>
					<label htmlFor="signin-password" className="block font-medium text-gray-700 text-sm">
						Password
					</label>
					<input
						type="password"
						id="signin-password"
						name="password"
						value={formData.password}
						onChange={handleChange}
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
					/>
					{errors.password && <p className="mt-1 text-red-600 text-sm">{errors.password}</p>}
				</div>

				<div className="flex gap-4">
					<button
						type="button"
						onClick={populateWithFaker}
						className="flex-1 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
					>
						Populate with Faker
					</button>
					<button
						type="submit"
						className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					>
						Sign In
					</button>
				</div>
			</form>
		</div>
	);
}

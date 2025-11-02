"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "~/lib/auth-client";

export default function RegisterPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		setLoading(true);

		try {
			// First, sign up with email and password
			const signUpResult = await signIn.email(
				{
					email,
					password,
					callbackURL: "/dashboard",
				},
				{
					onRequest: () => {
						setLoading(true);
					},
					onSuccess: async () => {
						// After sign-up, update the user's name
						try {
							await fetch("/api/auth/update-profile", {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({ name }),
							});
						} catch (err) {
							console.error("Failed to update profile:", err);
						}
						router.push("/dashboard");
					},
					onError: (ctx) => {
						setError(ctx.error.message || "Registration failed");
					},
				},
			);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};
	const handleDiscordSignUp = async () => {
		setError("");
		setLoading(true);

		try {
			await signIn.social(
				{
					provider: "discord",
					callbackURL: "/dashboard",
				},
				{
					onError: (ctx) => {
						setError(ctx.error.message || "Discord signup failed");
					},
				},
			);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8">
				<div>
					<h2 className="mt-6 text-center font-extrabold text-3xl text-gray-900">
						Create your account
					</h2>
				</div>

				{error && (
					<div className="rounded-md bg-red-50 p-4">
						<p className="font-medium text-red-800 text-sm">{error}</p>
					</div>
				)}

				<form className="mt-8 space-y-6" onSubmit={handleRegister}>
					<div className="space-y-4">
						<div>
							<label htmlFor="name" className="sr-only">
								Full Name
							</label>
							<input
								id="name"
								name="name"
								type="text"
								autoComplete="name"
								required
								className="relative block w-full appearance-none rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
								placeholder="Full Name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								disabled={loading}
							/>
						</div>

						<div>
							<label htmlFor="email-address" className="sr-only">
								Email address
							</label>
							<input
								id="email-address"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="relative block w-full appearance-none rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
								placeholder="Email address"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={loading}
							/>
						</div>

						<div>
							<label htmlFor="password" className="sr-only">
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="new-password"
								required
								className="relative block w-full appearance-none rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
								placeholder="Password (min. 6 characters)"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={loading}
							/>
						</div>

						<div>
							<label htmlFor="confirm-password" className="sr-only">
								Confirm Password
							</label>
							<input
								id="confirm-password"
								name="confirmPassword"
								type="password"
								autoComplete="new-password"
								required
								className="relative block w-full appearance-none rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
								placeholder="Confirm Password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								disabled={loading}
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 font-medium text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{loading ? "Creating account..." : "Sign up"}
					</button>
				</form>

				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-gray-300 border-t" />
					</div>
					<div className="relative flex justify-center text-sm">
						<span className="bg-gray-50 px-2 text-gray-500">Or sign up with</span>
					</div>
				</div>

				<button
					type="button"
					onClick={handleDiscordSignUp}
					disabled={loading}
					className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-500 text-sm shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<svg
						className="h-5 w-5"
						fill="currentColor"
						viewBox="0 0 24 24"
						aria-label="Discord logo"
					>
						<title>Discord</title>
						<path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.444.8635-.607 1.2552a18.224 18.224 0 00-5.487 0c-.163-.3917-.398-.8799-.609-1.2552a.077.077 0 00-.07847-.037 19.7363 19.7363 0 00-4.885 1.515.0699.0699 0 00-.032.0277C1.751 8.846.026 12.585 1.202 16.195a.0764.0764 0 00.033.0514c1.674.944 3.297 1.529 4.888 1.959.0265.006.055.002.067-.009a13.995 13.995 0 001.226-1.994.074.074 0 00-.041-.104a9.227 9.227 0 01-1.308-.623.073.073 0 01-.009-.119c.087-.066.174-.135.258-.206a.073.073 0 01.076-.01c2.744 1.26 5.715 1.26 8.424 0a.073.073 0 01.077.009c.084.071.171.14.259.206a.073.073 0 01-.008.119 9.18 9.18 0 01-1.309.622.074.074 0 00-.041.103c.36.629.77 1.236 1.226 1.994.015.017.044.021.067.009 1.592-.43 3.214-1.015 4.888-1.959a.076.076 0 00.033-.051c1.227-3.831-.213-7.169-1.798-10.133a.056.056 0 00-.021-.025zM8.278 14.6c-.761 0-1.386-.682-1.386-1.519 0-.837.61-1.518 1.386-1.518.777 0 1.387.682 1.386 1.518 0 .837-.609 1.519-1.386 1.519zm7.436 0c-.762 0-1.387-.682-1.387-1.519 0-.837.61-1.518 1.387-1.518.776 0 1.386.682 1.386 1.518 0 .837-.61 1.519-1.386 1.519z" />
					</svg>
					<span className="ml-2">Discord</span>
				</button>

				<p className="mt-2 text-center text-gray-600 text-sm">
					Already have an account?{" "}
					<Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}

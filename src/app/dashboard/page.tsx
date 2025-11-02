"use client";

import Link from "next/link";
import { useSession } from "~/lib/auth-client";

export default function Dashboard() {
	const { data: session, isPending } = useSession();

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<p className="text-gray-500 text-lg">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<nav className="bg-white shadow">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 justify-between">
						<div className="flex items-center">
							<h1 className="font-bold text-gray-900 text-xl">Stumate</h1>
						</div>
						<div className="flex items-center space-x-4">
							{session ? (
								<>
									<span className="text-gray-700 text-sm">
										Welcome, <span className="font-semibold">{session.user?.name}</span>!
									</span>
									<Link
										href="/profile"
										className="rounded-md bg-blue-600 px-4 py-2 font-medium text-sm text-white hover:bg-blue-700"
									>
										Profile
									</Link>
								</>
							) : (
								<>
									<Link
										href="/login"
										className="px-4 py-2 font-medium text-gray-700 text-sm hover:text-gray-900"
									>
										Sign In
									</Link>
									<Link
										href="/register"
										className="rounded-md bg-blue-600 px-4 py-2 font-medium text-sm text-white hover:bg-blue-700"
									>
										Sign Up
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			</nav>

			<main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				{session ? (
					<div className="space-y-8">
						<div className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white shadow-lg">
							<h2 className="mb-2 font-bold text-3xl">Welcome back, {session.user?.name}!</h2>
							<p className="text-blue-100">You are logged in with {session.user?.email}</p>
						</div>

						<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
							<div className="rounded-lg bg-white p-6 shadow">
								<h3 className="mb-2 font-semibold text-gray-900 text-lg">Account</h3>
								<p className="text-gray-600 text-sm">
									Manage your account settings and preferences
								</p>
								<Link
									href="/profile"
									className="mt-4 inline-block font-medium text-blue-600 hover:text-blue-700"
								>
									Go to Profile →
								</Link>
							</div>

							<div className="rounded-lg bg-white p-6 shadow">
								<h3 className="mb-2 font-semibold text-gray-900 text-lg">Features</h3>
								<p className="text-gray-600 text-sm">Explore all available features</p>
								<Link
									href="/dev"
									className="mt-4 inline-block font-medium text-blue-600 hover:text-blue-700"
								>
									Developer Tools →
								</Link>
							</div>

							<div className="rounded-lg bg-white p-6 shadow">
								<h3 className="mb-2 font-semibold text-gray-900 text-lg">Documentation</h3>
								<p className="text-gray-600 text-sm">Learn more about our platform</p>
								<a
									href="/docs"
									className="mt-4 inline-block font-medium text-blue-600 hover:text-blue-700"
								>
									Read Docs →
								</a>
							</div>
						</div>
					</div>
				) : (
					<div className="mx-auto max-w-md rounded-lg bg-white p-12 text-center shadow-lg">
						<h2 className="mb-4 font-bold text-2xl text-gray-900">Welcome to Stumate</h2>
						<p className="mb-8 text-gray-600">Sign in or create an account to get started</p>
						<div className="space-x-4">
							<Link
								href="/login"
								className="inline-block rounded-md bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
							>
								Sign In
							</Link>
							<Link
								href="/register"
								className="inline-block rounded-md border border-blue-600 px-6 py-2 font-medium text-blue-600 hover:bg-blue-50"
							>
								Sign Up
							</Link>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}

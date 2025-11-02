"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "~/lib/auth-client";

export default function SessionCard() {
	const { data: session, isPending } = useSession();
	const router = useRouter();

	if (isPending) {
		return (
			<div className="rounded-lg bg-white p-6 shadow">
				<p className="text-gray-500">Loading session...</p>
			</div>
		);
	}

	if (!session) {
		return (
			<div className="rounded-lg bg-white p-6 text-center shadow">
				<p className="mb-4 text-gray-600">Not signed in</p>
				<div className="space-x-2">
					<a
						href="/login"
						className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					>
						Sign In
					</a>
					<a
						href="/register"
						className="inline-block rounded-md border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50"
					>
						Sign Up
					</a>
				</div>
			</div>
		);
	}

	const handleSignOut = async () => {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/");
					router.refresh();
				},
			},
		});
	};

	return (
		<div className="max-w-md rounded-lg bg-white p-6 shadow">
			<h2 className="mb-4 font-bold text-2xl">Session Info</h2>

			<div className="space-y-4">
				{session.user?.image && (
					<div className="flex justify-center">
						<img
							src={session.user.image}
							alt={session.user.name || "User"}
							className="h-16 w-16 rounded-full"
						/>
					</div>
				)}

				<div className="border-t pt-4">
					<p className="text-gray-600 text-sm">Name</p>
					<p className="font-semibold">{session.user?.name || "N/A"}</p>
				</div>

				<div className="border-t pt-4">
					<p className="text-gray-600 text-sm">Email</p>
					<p className="break-all font-semibold">{session.user?.email || "N/A"}</p>
				</div>

				<div className="border-t pt-4">
					<p className="text-gray-600 text-sm">User ID</p>
					<p className="break-all font-mono text-sm">{session.user?.id || "N/A"}</p>
				</div>

				<div className="border-t pt-4">
					<p className="text-gray-600 text-sm">Session ID</p>
					<p className="break-all font-mono text-sm">{session.session?.id?.substring(0, 20)}...</p>
				</div>

				<div className="border-t pt-4">
					<p className="text-gray-600 text-sm">Expires At</p>
					<p className="text-sm">
						{session.session?.expiresAt
							? new Date(session.session.expiresAt).toLocaleString()
							: "N/A"}
					</p>
				</div>

				<button
					type="button"
					onClick={handleSignOut}
					className="mt-6 w-full rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
				>
					Sign Out
				</button>
			</div>

			<div className="mt-6 rounded border border-gray-200 bg-gray-50 p-4">
				<p className="mb-2 text-gray-600 text-xs">Full Session Data</p>
				<pre className="max-h-40 overflow-auto rounded border border-gray-300 bg-white p-2 text-xs">
					{JSON.stringify(session, null, 2)}
				</pre>
			</div>
		</div>
	);
}

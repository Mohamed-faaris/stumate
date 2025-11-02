"use client";

import SessionCard from "~/components/SessionCard";

export default function ProfilePage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-2xl">
				<h1 className="mb-8 text-center font-bold text-4xl text-gray-900">Your Profile</h1>

				<div className="grid grid-cols-1 gap-8">
					<SessionCard />

					<div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
						<h2 className="mb-3 font-semibold text-blue-900 text-lg">About Your Session</h2>
						<ul className="space-y-2 text-blue-800 text-sm">
							<li>✓ Your session is securely managed with Better Auth</li>
							<li>✓ Click "Sign Out" to end your session</li>
							<li>✓ Session data is displayed above</li>
							<li>✓ Your authentication provider is stored with your account</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

"use client";

import { useSession } from "~/lib/auth-client";

export function SessionDisplay() {
  const { data: session, isPending: sessionLoading } = useSession();

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 font-bold text-2xl">Current Session</h2>
      {sessionLoading ? (
        <p>Loading session...</p>
      ) : session ? (
        <div className="space-y-2">
          <p>
            <strong>Name:</strong> {session.user?.name}
          </p>
          <p>
            <strong>Email:</strong> {session.user?.email}
          </p>
          <p>
            <strong>ID:</strong> {session.user?.id}
          </p>
          <pre className="mt-4 overflow-auto rounded bg-gray-50 p-4 text-sm">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      ) : (
        <p className="text-gray-500">No active session</p>
      )}
    </div>
  );
}

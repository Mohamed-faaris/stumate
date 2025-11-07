"use client";

import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  name: string;
  email: string;
}

interface ApiResponse<T> {
  success: boolean;
  users?: T[];
  groups?: T[];
  forms?: T[];
}

const fetchUsers = async () => {
  const response = await fetch("/api/test/user");
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
};

export function UsersList() {
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 font-bold text-2xl">Users</h2>
      {usersLoading ? (
        <p>Loading users...</p>
      ) : (
        <div className="space-y-2">
          {(usersData as ApiResponse<User>)?.users?.map((user: User) => (
            <div key={user.id} className="rounded border p-2">
              <p className="font-medium">{user.name}</p>
              <p className="text-gray-600 text-sm">{user.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

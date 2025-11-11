"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  size: number;
}

interface ApiResponse<T> {
  success: boolean;
  users?: T[];
  groups?: T[];
  forms?: T[];
}

const fetchGroups = async () => {
  const response = await fetch("/api/test/group");
  if (!response.ok) throw new Error("Failed to fetch groups");
  return response.json();
};

const fetchUsers = async () => {
  const response = await fetch("/api/test/user");
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
};

const addMembersToGroup = async (data: {
  groupId: string;
  userId: string[];
}) => {
  const response = await fetch("/api/test/group/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to add members");
  return response.json();
};

export function GroupsList() {
  const queryClient = useQueryClient();
  const [selectedUsers, setSelectedUsers] = useState<
    Record<string, Set<string>>
  >({});

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
  });

  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const addMembersMutation = useMutation({
    mutationFn: addMembersToGroup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success(data.message || "Members added successfully!");
      // Clear selected users for all groups
      setSelectedUsers({});
    },
    onError: (error) => {
      toast.error(`Error adding members: ${error.message}`);
    },
  });

  const handleUserToggle = (groupId: string, userId: string) => {
    setSelectedUsers((prev) => {
      const groupUsers = prev[groupId] || new Set<string>();
      const newSet = new Set(groupUsers);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return {
        ...prev,
        [groupId]: newSet,
      };
    });
  };

  const handleAddMembers = (groupId: string) => {
    const userIds = Array.from(selectedUsers[groupId] || []);
    if (userIds.length === 0) {
      toast.error("Please select at least one user");
      return;
    }
    addMembersMutation.mutate({ groupId, userId: userIds });
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 font-bold text-2xl">Groups</h2>
      {groupsLoading ? (
        <p>Loading groups...</p>
      ) : (
        <div className="space-y-4">
          {(groupsData as ApiResponse<Group>)?.groups?.map((group: Group) => (
            <div key={group.id} className="rounded border p-4">
              <h3 className="font-medium text-lg">{group.name}</h3>
              <p className="mb-2 text-gray-600 text-sm">{group.description}</p>
              <p className="text-gray-500 text-xs">Members: {group.size}</p>

              <div className="mt-4">
                <h4 className="mb-2 font-medium text-sm">Add Members:</h4>
                <div className="mb-3 max-h-40 space-y-2 overflow-y-auto">
                  {(usersData as ApiResponse<User>)?.users?.map(
                    (user: User) => (
                      <label
                        key={user.id}
                        className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-gray-100"
                      >
                        <input
                          type="checkbox"
                          checked={(selectedUsers[group.id] || new Set()).has(
                            user.id
                          )}
                          onChange={() => handleUserToggle(group.id, user.id)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">
                          {user.name}
                          <span className="ml-1 text-gray-500 text-xs">
                            ({user.email})
                          </span>
                        </span>
                      </label>
                    )
                  )}
                </div>
                {(selectedUsers[group.id]?.size || 0) > 0 && (
                  <p className="mb-2 text-blue-600 text-xs">
                    {selectedUsers[group.id]?.size} user(s) selected
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => handleAddMembers(group.id)}
                  disabled={
                    (selectedUsers[group.id]?.size || 0) === 0 ||
                    addMembersMutation.isPending
                  }
                  className="w-full rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {addMembersMutation.isPending
                    ? "Adding..."
                    : `Add ${selectedUsers[group.id]?.size || 0} Member(s)`}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

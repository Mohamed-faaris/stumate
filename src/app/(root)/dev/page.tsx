"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "~/lib/auth-client";
import { SignUpForm } from "~/components/dev/SignUpForm";
import { SignInForm } from "~/components/dev/SignInForm";
import { GroupForm } from "~/components/dev/GroupForm";
import { FormCreator } from "~/components/dev/FormCreator";
import { FormsList } from "~/components/dev/FormsList";
import { SessionDisplay } from "~/components/dev/SessionDisplay";
import { UsersList } from "~/components/dev/UsersList";
import { GroupsList } from "~/components/dev/GroupsList";

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

const fetchUsers = async () => {
  const response = await fetch("/api/test/user");
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
};

const fetchGroups = async () => {
  const response = await fetch("/api/test/group");
  if (!response.ok) throw new Error("Failed to fetch groups");
  return response.json();
};

const addMemberToGroup = async (data: { groupId: string; userId: string }) => {
  const response = await fetch("/api/test/group/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to add member");
  return response.json();
};

export default function DevPage() {
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionLoading } = useSession();

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
  });

  const addMemberMutation = useMutation({
    mutationFn: addMemberToGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      alert("Member added successfully!");
    },
    onError: (error) => {
      alert(`Error adding member: ${error.message}`);
    },
  });

  const handleAddMember = (groupId: string, userId: string) => {
    addMemberMutation.mutate({ groupId, userId });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-center font-bold text-3xl">Dev Page</h1>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <SignUpForm />
          <SignInForm />
          <GroupForm />
          <FormCreator />
        </div>

        <div className="mt-12">
          <FormsList />
        </div>

        <div className="mt-12">
          <SessionDisplay />
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <UsersList />
          <GroupsList />
        </div>
      </div>
    </div>
  );
}

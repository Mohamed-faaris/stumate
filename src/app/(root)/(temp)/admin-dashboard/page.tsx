"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

interface Form {
	id: string;
	title: string;
	description: string | null;
	config: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
}

interface ApiResponse<T> {
	success: boolean;
	forms?: T[];
}

const fetchForms = async (): Promise<ApiResponse<Form>> => {
	const response = await fetch("/api/form");
	if (!response.ok) throw new Error("Failed to fetch forms");
	return response.json();
};

export default function AdminDashboardPage() {
	const router = useRouter();
	const { data, isLoading, error } = useQuery({
		queryKey: ["forms"],
		queryFn: fetchForms,
	});

	const forms = (data as ApiResponse<Form>)?.forms || [];

	return (
		<div className="space-y-6 p-8">
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-3xl">Forms</h1>
				<Button onClick={() => router.push("/admin-dashboard/create-form")}>
					Create New Form
				</Button>
			</div>

			{isLoading && <p className="text-gray-600">Loading forms...</p>}
			{error && <p className="text-red-600">Error loading forms</p>}

			{forms.length === 0 && !isLoading ? (
				<Card className="p-6 text-center">
					<p className="text-gray-600">No forms yet. Create one to get started!</p>
				</Card>
			) : (
				<div className="grid gap-4">
					{forms.map((form) => (
						<Card key={form.id} className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-semibold text-lg">{form.title}</h3>
									<p className="text-gray-600 text-sm">{form.description}</p>
									<p className="mt-2 text-gray-500 text-xs">
										Updated: {new Date(form.updatedAt).toLocaleDateString()}
									</p>
								</div>
								<Button
									variant="outline"
									onClick={() =>
										router.push(`/admin-dashboard/${form.id}`)
									}
								>
									View Form
								</Button>
							</div>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
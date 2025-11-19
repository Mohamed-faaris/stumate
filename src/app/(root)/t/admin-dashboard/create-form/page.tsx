"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

interface FormData {
  title: string;
  description: string;
  config: {
    type: "Section" | "PageBreak";
    collapsible: boolean;
    collapsedByDefault: boolean;
    table: {
      columns: number | string[];
      allowExtendColumns: boolean;
      requiresAnswerInEachCell: boolean;
    } | null;
  };
}

const createForm = async (data: FormData) => {
  const response = await fetch("/api/form", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create form");
  return response.json();
};

export default function CreateFormPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    config: {
      type: "Section",
      collapsible: false,
      collapsedByDefault: false,
      table: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: createForm,
    onSuccess: (data) => {
      toast.success("Form created successfully!");
      router.push(`/admin-dashboard/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter a form title");
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 p-8">
      <h1 className="font-bold text-3xl">Create New Form</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Form Title</Label>
            <Input
              id="title"
              placeholder="Enter form title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter form description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Form"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

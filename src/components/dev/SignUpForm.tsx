"use client";

import { faker } from "@faker-js/faker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { signUp } from "~/lib/auth-client";
import { toast } from "sonner";

// Sign Up Form Schema
const signUpFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});

type SignUpFormData = z.infer<typeof signUpFormSchema>;

const handleSignUp = async (data: SignUpFormData) => {
  const result = await signUp.email({
    email: data.email,
    password: data.password,
    name: data.name,
  });
  return result;
};

export function SignUpForm() {
  const queryClient = useQueryClient();
  const signUpMutation = useMutation({
    mutationFn: handleSignUp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Sign up successful!");
    },
    onError: (error) => {
      toast.error(`Sign up failed: ${error.message}`);
    },
  });

  const [formData, setFormData] = useState<SignUpFormData>({
    email: "",
    password: "123123123",
    name: "",
  });
  const [errors, setErrors] = useState<Partial<SignUpFormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = signUpFormSchema.parse(formData);
      signUpMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        for (const err of error.errors) {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        }
        setErrors(fieldErrors as Partial<SignUpFormData>);
      }
    }
  };

  const populateWithFaker = () => {
    setFormData({
      email: faker.internet.email(),
      password: "123123123",
      name: faker.person.fullName(),
    });
    setErrors({});
  };

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 font-bold text-2xl">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="signup-name"
            className="block font-medium text-gray-700 text-sm"
          >
            Name
          </label>
          <input
            type="text"
            id="signup-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          {errors.name && (
            <p className="mt-1 text-red-600 text-sm">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="block font-medium text-gray-700 text-sm"
          >
            Email
          </label>
          <input
            type="email"
            id="signup-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          {errors.email && (
            <p className="mt-1 text-red-600 text-sm">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="block font-medium text-gray-700 text-sm"
          >
            Password
          </label>
          <input
            type="password"
            id="signup-password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
          {errors.password && (
            <p className="mt-1 text-red-600 text-sm">{errors.password}</p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={populateWithFaker}
            className="flex-1 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Populate with Faker
          </button>
          <button
            type="submit"
            className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}

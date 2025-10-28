"use client";
import { useState } from "react";
import type { PostBody } from "~/types/user";
import { PostBodySchema } from "~/types/user";

export default function RegisterPage() {
	const [data, setData] = useState<PostBody>({
		name: "",
		email: "",
		password: "",
		image: undefined,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const result = PostBodySchema.safeParse(data);

		if (!result.success) {
			const errors = result.error.errors.map((err) => err.message).join("\n");
			alert(`Validation Errors:\n${errors}`);
		} else {
			fetch("/api/user", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.success) {
						alert(`${data.user.id} registered successfully!`);
					} else {
						alert(`Error: ${data.error}`);
					}
				})
				.catch((error) => {
					alert(`Error: ${error.message}`);
				});
		}
	};

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					value={data.name}
					onChange={(e) => setData({ ...data, name: e.target.value })}
					placeholder="Name"
				/>
				<input
					type="email"
					value={data.email}
					onChange={(e) => setData({ ...data, email: e.target.value })}
					placeholder="Email"
				/>
				<input
					type="password"
					value={data.password}
					onChange={(e) => setData({ ...data, password: e.target.value })}
					placeholder="Password"
				/>
				<input
					value={data.image || ""}
					onChange={(e) => setData({ ...data, image: e.target.value || undefined })}
					placeholder="Image URL"
				/>
				<button type="submit">Register</button>
			</form>
		</div>
	);
}

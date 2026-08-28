"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth, ApiError } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { User } from "@/types";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const data = await api.patch<{ user: User }>("/auth/me", { name, email });
      setUser(data.user);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Profile</h1>

      <Card className="max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <ErrorMessage message={error} />}
          {success && (
            <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <Input
            id="profile-name"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            id="profile-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input id="profile-role" label="Role" value={user?.role || ""} disabled />

          <Button type="submit" isLoading={isSubmitting} className="mt-2 w-fit">
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
}

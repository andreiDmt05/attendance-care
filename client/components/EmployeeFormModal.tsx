"use client";

import { FormEvent, useState } from "react";
import { User } from "@/types";
import { api, ApiError } from "@/lib/api";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  employee?: User | null;
}

const ROLE_OPTIONS = [
  { label: "Employee", value: "EMPLOYEE" },
  { label: "Admin", value: "ADMIN" },
];

export default function EmployeeFormModal({
  isOpen,
  onClose,
  onSaved,
  employee,
}: EmployeeFormModalProps) {
  const isEditing = !!employee;

  const [name, setName] = useState(employee?.name || "");
  const [email, setEmail] = useState(employee?.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(employee?.role || "EMPLOYEE");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetAndClose = () => {
    setError("");
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isEditing && employee) {
        await api.patch(`/employees/${employee.id}`, { name, email, role });
      } else {
        await api.post("/employees", { name, email, password, role });
      }
      onSaved();
      resetAndClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title={isEditing ? "Edit Employee" : "Add Employee"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <ErrorMessage message={error} />}

        <Input
          id="employee-name"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          id="employee-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {!isEditing && (
          <Input
            id="employee-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        )}

        <Select
          id="employee-role"
          label="Role"
          options={ROLE_OPTIONS}
          value={role}
          onChange={(e) => setRole(e.target.value as "ADMIN" | "EMPLOYEE")}
        />

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? "Save Changes" : "Add Employee"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

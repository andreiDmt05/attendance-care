"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError } from "@/lib/api";
import { User } from "@/types";
import { formatDate } from "@/lib/utils";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/Table";
import EmployeeFormModal from "@/components/EmployeeFormModal";
import EmployeeDetailsModal from "@/components/EmployeeDetailsModal";

export default function EmployeesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<User | null>(null);

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const loadEmployees = () => {
    setIsLoading(true);
    api
      .get<{ employees: User[] }>("/employees")
      .then((data) => setEmployees(data.employees))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load employees"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleDeactivate = async (employee: User) => {
    if (!confirm(`Deactivate ${employee.name}?`)) return;

    try {
      await api.delete(`/employees/${employee.id}`);
      loadEmployees();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to deactivate employee");
    }
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  const openEditModal = (employee: User) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  if (user && user.role !== "ADMIN") return null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Employees</h1>
        <Button onClick={openAddModal}>Add Employee</Button>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : employees.length === 0 ? (
          <EmptyState message="No employees yet" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Created</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>
                    <Badge color={employee.isActive ? "green" : "red"}>
                      {employee.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(employee.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-3">
                      <button
                        className="text-sm font-medium text-slate-600 hover:text-slate-900"
                        onClick={() => setViewingEmployee(employee)}
                      >
                        View
                      </button>
                      <button
                        className="text-sm font-medium text-slate-600 hover:text-slate-900"
                        onClick={() => openEditModal(employee)}
                      >
                        Edit
                      </button>
                      {employee.isActive && (
                        <button
                          className="text-sm font-medium text-red-600 hover:text-red-800"
                          onClick={() => handleDeactivate(employee)}
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <EmployeeFormModal
        key={editingEmployee?.id || "new"}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={loadEmployees}
        employee={editingEmployee}
      />

      <EmployeeDetailsModal
        isOpen={!!viewingEmployee}
        onClose={() => setViewingEmployee(null)}
        employee={viewingEmployee}
      />
    </div>
  );
}

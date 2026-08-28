"use client";

import { useAuth } from "@/hooks/useAuth";
import AdminDashboard from "@/components/AdminDashboard";
import EmployeeDashboard from "@/components/EmployeeDashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">
        {user?.role === "ADMIN" ? "Admin Dashboard" : "My Dashboard"}
      </h1>
      {user?.role === "ADMIN" ? <AdminDashboard /> : <EmployeeDashboard />}
    </div>
  );
}

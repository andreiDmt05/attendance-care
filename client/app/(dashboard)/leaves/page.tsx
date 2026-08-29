"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError } from "@/lib/api";
import { LeaveRequest } from "@/types";
import { formatDate } from "@/lib/utils";
import { leaveStatusColor } from "@/lib/statusColor";
import Card from "@/components/Card";
import Select from "@/components/Select";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/Table";
import LeaveRequestFormModal from "@/components/LeaveRequestFormModal";

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

const employeeName = (employeeId: unknown) => {
  if (employeeId && typeof employeeId === "object" && "name" in employeeId) {
    return (employeeId as { name: string }).name;
  }
  return "Unknown";
};

export default function LeavesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadLeaves = () => {
    setIsLoading(true);
    setError("");
    const query = status ? `?status=${status}` : "";
    api
      .get<{ leaves: LeaveRequest[] }>(`/leaves${query}`)
      .then((data) => setLeaves(data.leaves))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load leave requests"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleUpdateStatus = async (leave: LeaveRequest, newStatus: "APPROVED" | "REJECTED") => {
    try {
      await api.patch(`/leaves/${leave._id}`, { status: newStatus });
      loadLeaves();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update leave request");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-xl font-semibold text-slate-900">Leave Requests</h1>
        {!isAdmin && <Button onClick={() => setIsFormOpen(true)}>Request Leave</Button>}
      </div>

      <Card className="mb-6">
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={STATUS_OPTIONS}
          className="max-w-xs"
        />
      </Card>

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
        ) : leaves.length === 0 ? (
          <EmptyState message="No leave requests found" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                {isAdmin && <TableHeaderCell>Employee</TableHeaderCell>}
                <TableHeaderCell>Start Date</TableHeaderCell>
                <TableHeaderCell>End Date</TableHeaderCell>
                <TableHeaderCell>Reason</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                {isAdmin && <TableHeaderCell>Actions</TableHeaderCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow key={leave._id}>
                  {isAdmin && <TableCell>{employeeName(leave.employeeId)}</TableCell>}
                  <TableCell>{formatDate(leave.startDate)}</TableCell>
                  <TableCell>{formatDate(leave.endDate)}</TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>
                    <Badge color={leaveStatusColor(leave.status)}>{leave.status}</Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      {leave.status === "PENDING" && (
                        <div className="flex gap-3">
                          <button
                            className="appearance-none cursor-pointer text-sm font-medium text-green-700 hover:text-green-900"
                            onClick={() => handleUpdateStatus(leave, "APPROVED")}
                          >
                            Approve
                          </button>
                          <button
                            className="appearance-none cursor-pointer text-sm font-medium text-red-600 hover:text-red-800"
                            onClick={() => handleUpdateStatus(leave, "REJECTED")}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <LeaveRequestFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={loadLeaves}
      />
    </div>
  );
}

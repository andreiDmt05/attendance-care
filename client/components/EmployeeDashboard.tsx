"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { EmployeeDashboardData } from "@/types";
import { formatDate, formatTime, formatHours } from "@/lib/utils";
import StatCard from "@/components/StatCard";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/Table";
import { statusColor, leaveStatusColor } from "@/lib/statusColor";

export default function EmployeeDashboard() {
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDashboard = () => {
    api
      .get<EmployeeDashboardData>("/dashboard/employee")
      .then(setData)
      .catch(() => setError("Failed to load dashboard data"));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleClockIn = async () => {
    setActionError("");
    setIsSubmitting(true);
    try {
      await api.post("/attendance/clock-in");
      loadDashboard();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to clock in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClockOut = async () => {
    setActionError("");
    setIsSubmitting(true);
    try {
      await api.post("/attendance/clock-out");
      loadDashboard();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to clock out");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) return <ErrorMessage message={error} />;

  if (!data) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const hasClockedIn = !!data.todayRecord?.clockIn;
  const hasClockedOut = !!data.todayRecord?.clockOut;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          label="Today's Status"
          value={data.todayRecord ? data.todayRecord.status : "Not clocked in"}
        />
        <StatCard label="Today's Hours" value={formatHours(data.todayRecord?.totalHours || 0)} />
        <StatCard label="Monthly Hours" value={formatHours(data.monthlyHours)} />
      </div>

      <Card title="Clock In / Clock Out">
        {actionError && (
          <div className="mb-4">
            <ErrorMessage message={actionError} />
          </div>
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="text-sm text-slate-600">
              Clock in: <span className="font-medium">{formatTime(data.todayRecord?.clockIn)}</span>
            </p>
            <p className="text-sm text-slate-600">
              Clock out: <span className="font-medium">{formatTime(data.todayRecord?.clockOut)}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleClockIn} disabled={hasClockedIn} isLoading={isSubmitting}>
              Clock In
            </Button>
            <Button
              variant="secondary"
              onClick={handleClockOut}
              disabled={!hasClockedIn || hasClockedOut}
              isLoading={isSubmitting}
            >
              Clock Out
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Recent Attendance">
        {data.recentAttendance.length === 0 ? (
          <EmptyState message="No attendance records yet" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Clock In</TableHeaderCell>
                <TableHeaderCell>Clock Out</TableHeaderCell>
                <TableHeaderCell>Total Hours</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.recentAttendance.map((record) => (
                <TableRow key={record._id}>
                  <TableCell>{formatDate(record.date)}</TableCell>
                  <TableCell>{formatTime(record.clockIn)}</TableCell>
                  <TableCell>{formatTime(record.clockOut)}</TableCell>
                  <TableCell>{formatHours(record.totalHours)}</TableCell>
                  <TableCell>
                    <Badge color={statusColor(record.status)}>{record.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card title="Leave Requests">
        {data.leaves.length === 0 ? (
          <EmptyState message="No leave requests yet" />
        ) : (
          <div className="flex flex-col gap-3">
            {data.leaves.map((leave) => (
              <div
                key={leave._id}
                className="flex flex-col justify-between gap-1 border-b border-slate-100 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </p>
                  <p className="text-xs text-slate-500">{leave.reason}</p>
                </div>
                <Badge color={leaveStatusColor(leave.status)}>{leave.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AdminDashboardData } from "@/types";
import { formatDate, formatTime, formatHours } from "@/lib/utils";
import StatCard from "@/components/StatCard";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/Table";
import { statusColor } from "@/lib/statusColor";

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<AdminDashboardData>("/dashboard/admin")
      .then(setData)
      .catch(() => setError("Failed to load dashboard data"));
  }, []);

  if (error) return <ErrorMessage message={error} />;

  if (!data) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const employeeName = (employeeId: unknown) => {
    if (employeeId && typeof employeeId === "object" && "name" in employeeId) {
      return (employeeId as { name: string }).name;
    }
    return "Unknown";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Employees" value={data.stats.totalEmployees} />
        <StatCard label="Present Today" value={data.stats.presentToday} />
        <StatCard label="Absent Today" value={data.stats.absentToday} />
        <StatCard label="On Leave" value={data.stats.onLeaveToday} />
        <StatCard label="Hours This Month" value={formatHours(data.stats.totalHoursThisMonth)} />
      </div>

      <Card title="Pending Leave Requests">
        {data.pendingLeaves.length === 0 ? (
          <EmptyState message="No pending leave requests" />
        ) : (
          <div className="flex flex-col gap-3">
            {data.pendingLeaves.map((leave) => (
              <div
                key={leave._id}
                className="flex flex-col justify-between gap-1 border-b border-slate-100 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {employeeName(leave.employeeId)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)} · {leave.reason}
                  </p>
                </div>
                <Badge color="yellow">Pending</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Recent Attendance Activity">
        {data.recentAttendance.length === 0 ? (
          <EmptyState message="No attendance records yet" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Employee</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Clock In</TableHeaderCell>
                <TableHeaderCell>Clock Out</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.recentAttendance.map((record) => (
                <TableRow key={record._id}>
                  <TableCell>{employeeName(record.employeeId)}</TableCell>
                  <TableCell>{formatDate(record.date)}</TableCell>
                  <TableCell>{formatTime(record.clockIn)}</TableCell>
                  <TableCell>{formatTime(record.clockOut)}</TableCell>
                  <TableCell>
                    <Badge color={statusColor(record.status)}>{record.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

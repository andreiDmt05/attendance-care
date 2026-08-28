"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError, API_BASE_URL } from "@/lib/api";
import { AttendanceRecord, User } from "@/types";
import { formatDate, formatTime, formatHours } from "@/lib/utils";
import { statusColor } from "@/lib/statusColor";
import Card from "@/components/Card";
import Select from "@/components/Select";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/Table";
import AttendanceEditModal from "@/components/AttendanceEditModal";

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Present", value: "PRESENT" },
  { label: "Absent", value: "ABSENT" },
  { label: "Incomplete", value: "INCOMPLETE" },
];

const employeeName = (employeeId: unknown) => {
  if (employeeId && typeof employeeId === "object" && "name" in employeeId) {
    return (employeeId as { name: string }).name;
  }
  return "Unknown";
};

export default function AttendancePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (isAdmin) {
      api
        .get<{ employees: User[] }>("/employees")
        .then((data) => setEmployees(data.employees))
        .catch(() => {});
    }
  }, [isAdmin]);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (isAdmin && employeeId) params.set("employeeId", employeeId);
    if (date) params.set("date", date);
    if (!date && month) params.set("month", month);
    if (status) params.set("status", status);
    return params.toString();
  };

  const loadAttendance = () => {
    setIsLoading(true);
    setError("");
    api
      .get<{ records: AttendanceRecord[] }>(`/attendance?${buildQuery()}`)
      .then((data) => setRecords(data.records))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load attendance"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, date, month, status]);

  const handleExportCsv = async () => {
    const res = await fetch(`${API_BASE_URL}/attendance/export?${buildQuery()}`, {
      credentials: "include",
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "attendance.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-xl font-semibold text-slate-900">Attendance</h1>
        {isAdmin && <Button onClick={handleExportCsv}>Export CSV</Button>}
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isAdmin && (
            <Select
              label="Employee"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              options={[{ label: "All Employees", value: "" }, ...employees.map((e) => ({ label: e.name, value: e.id }))]}
            />
          )}
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setMonth("");
            }}
          />
          <Input
            label="Month"
            type="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setDate("");
            }}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STATUS_OPTIONS}
          />
        </div>
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
        ) : records.length === 0 ? (
          <EmptyState message="No attendance records found" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Employee</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Clock In</TableHeaderCell>
                <TableHeaderCell>Clock Out</TableHeaderCell>
                <TableHeaderCell>Total Hours</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                {isAdmin && <TableHeaderCell>Actions</TableHeaderCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record._id}>
                  <TableCell>{employeeName(record.employeeId)}</TableCell>
                  <TableCell>{formatDate(record.date)}</TableCell>
                  <TableCell>{formatTime(record.clockIn)}</TableCell>
                  <TableCell>{formatTime(record.clockOut)}</TableCell>
                  <TableCell>{formatHours(record.totalHours)}</TableCell>
                  <TableCell>
                    <Badge color={statusColor(record.status)}>{record.status}</Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <button
                        className="text-sm font-medium text-slate-600 hover:text-slate-900"
                        onClick={() => setEditingRecord(record)}
                      >
                        Edit
                      </button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <AttendanceEditModal
        isOpen={!!editingRecord}
        key={editingRecord?._id || "none"}
        onClose={() => setEditingRecord(null)}
        onSaved={loadAttendance}
        record={editingRecord}
      />
    </div>
  );
}

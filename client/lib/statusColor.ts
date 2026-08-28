import { AttendanceStatus, LeaveStatus } from "@/types";

export const statusColor = (status: AttendanceStatus): "green" | "red" | "yellow" => {
  if (status === "PRESENT") return "green";
  if (status === "ABSENT") return "red";
  return "yellow";
};

export const leaveStatusColor = (status: LeaveStatus): "green" | "red" | "yellow" => {
  if (status === "APPROVED") return "green";
  if (status === "REJECTED") return "red";
  return "yellow";
};

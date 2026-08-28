export type UserRole = "ADMIN" | "EMPLOYEE";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "INCOMPLETE";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

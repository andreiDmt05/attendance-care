export type UserRole = "ADMIN" | "EMPLOYEE";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "INCOMPLETE";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
}

export interface AttendanceRecord {
  _id: string;
  employeeId: User | string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  totalHours: number;
  status: AttendanceStatus;
}

export interface LeaveRequest {
  _id: string;
  employeeId: User | string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
}

export interface WorkSchedule {
  _id: string;
  employeeId: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface AdminDashboardData {
  stats: {
    totalEmployees: number;
    presentToday: number;
    absentToday: number;
    onLeaveToday: number;
    totalHoursThisMonth: number;
  };
  recentAttendance: AttendanceRecord[];
  pendingLeaves: LeaveRequest[];
}

export interface EmployeeDashboardData {
  todayRecord: AttendanceRecord | null;
  monthlyHours: number;
  recentAttendance: AttendanceRecord[];
  leaves: LeaveRequest[];
}
